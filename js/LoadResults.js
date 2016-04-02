"use strict";
define(function(require) {

  // Imports
  var Milestone = require('Milestone');
  var FilterConstants = Milestone.getFilterConstants();
  var DateConverter = require('DateConverter');
  var FilterPanel = require('FilterPanel');
  var Pikaday = require('lib/pikaday/pikaday');

  // Set things up
  var startDates = DateConverter.getStartDates();
  var filterPanel;

  var resultsContainer = document.getElementById("results_container");
  var resultCount = document.getElementById("result_count");
  var resultsHeader = document.getElementById("results_header");
  var results = [];
  var pickers = [];

  var htmlDownArrow = "&#9660;";
  var htmlRightArrow = "&#9654;";

  var earliestShown = new Date();
  earliestShown.setHours(0,0,0,0);

  // After a filter has been toggled, update results (change visibility of Milestone elts + headers)
  function updateResults(numToReveal = 0) {
    var all_checkboxes = filterPanel.getAllCheckboxes();
    var visible_count = 0; // number we add to DOM
    var found_count = 0; // max the user could see with these filter options
    var newly_revealed = 0;

    var minResultsShown = 50;
    var earlierExist = false;
    var laterExist = false;
    var previousElement = false;
    var previousVisibleElementHeader = false;

    for (var result of results) {
      var filterVisible = !isHiddenByFilters(result);
      var afterStart = result.end_date > earliestShown;
      var showMore = visible_count < minResultsShown;
      var revealMore = newly_revealed < numToReveal;

      if (filterVisible && afterStart && (showMore || revealMore)) {
        if (!result.is_visible()) {
          newly_revealed ++;
        }
        if (!result.html_element) {
          var resNode = document.createElement("p");
          resNode.className = "entry";
          result.attachElement(resNode);
          insertAfterChild(resultsContainer, previousElement, result.html_element);
        }
        var currentElementHeader = result.html_element.firstChild;
        var repeatHeader = (currentElementHeader.textContent == previousVisibleElementHeader.textContent);
        currentElementHeader.style.display = repeatHeader ? 'none' : 'block';
        previousVisibleElementHeader = currentElementHeader;
        visible_count++;
      }

      // bookkeeping and follow-ups.
      result.set_visible(filterVisible);
      earlierExist = earlierExist || (filterVisible && !afterStart);
      laterExist = laterExist || (filterVisible && !showMore);
      if (filterVisible) found_count ++;
      if (result.html_element) {
        previousElement = result.html_element;
      }

      // Helper subfunctions
      function isHiddenByFilters(result) {
        for (var checkbox of all_checkboxes) {
          if (!checkbox.checked && checkbox.testing_function(result)) {
            return true;
          }
        }
        return false;
      }

      function insertAfterChild(parent, child, newNode) {
        var nextSib = child.nextSibling;
        if (nextSib) {
          parent.insertBefore(newNode, nextSib);
        } else {
          parent.appendChild(newNode);
        }
      }
    }

    if (numToReveal > 0) {
      console.log("revealed " + newly_revealed + " more items. (goal: " + numToReveal + ")");
    }

    document.getElementById("earlier_results").style.display = earlierExist ? 'block' : 'none';
    document.getElementById("later_results").style.display = laterExist ? 'block' : 'none';

    if (visible_count === results.length) {
      resultCount.textContent = "showing all " + results.length + " results";
    } else {
      resultCount.textContent = visible_count + " shown (" + results.length + " total)";
    }
  }

  function generateMilestones() {
    // Clear all existing milestones + DOM elements
    while(resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }
    results = [];

    function addMilestone(stone) {
      if (stone && stone.valid) {
        results.push(stone);
      }
    }

    // Basic numbers (1, 10, 100...) in all bases
    for (var direction of FilterConstants.DirectionValues) {
      for (var start_date of startDates) {
        for (var magnitude of FilterConstants.MagnitudeValues) {
          for (var time_unit of FilterConstants.TimeUnitValues) {
            for (var base_unit of FilterConstants.BaseValues) {
              addMilestone(Milestone.baseMilestone(start_date, time_unit, magnitude, direction, base_unit));
            }
          }
        }
      }
    }

    // Repeated digits (111, 222, 333 ...) base 10 only
    for (var direction of FilterConstants.DirectionValues) {
      for (var start_date of startDates) {
        for (var magnitude of FilterConstants.MagnitudeValues) {
          for (var time_unit of FilterConstants.TimeUnitValues) {
            for (var repeat of FilterConstants.RepeatingDigitValues) {
              addMilestone(Milestone.repeatDigitMilestone(start_date, time_unit, magnitude, direction, repeat));
            }
          }
        }
      }
    }

    // One leading digit: (2000, 3000, 4000). base 10 only.
    for (var direction of FilterConstants.DirectionValues) {
      for (var start_date of startDates) {
        for (var magnitude of FilterConstants.MagnitudeValues) {
          for (var time_unit of FilterConstants.TimeUnitValues) {
            for (var prefix of FilterConstants.OneDigitPrefixValues) {
              addMilestone(Milestone.prefixOneMilestone(start_date, time_unit, magnitude, direction, prefix));
            }
          }
        }
      }
    }

    // Two leading digits: (12000, 13000, 14000). base 10 only.
    for (var direction of FilterConstants.DirectionValues) {
      for (var start_date of startDates) {
        for (var magnitude of FilterConstants.MagnitudeValues) {
          for (var time_unit of FilterConstants.TimeUnitValues) {
            for (var prefix of FilterConstants.TwoDigitPrefixValues) {
              addMilestone(Milestone.prefixTwoMilestone(start_date, time_unit, magnitude, direction, prefix));
            }
          }
        }
      }
    }

    // Sequences: (12345, 54321). base 10 only.
    for (var direction of FilterConstants.DirectionValues) {
      for (var start_date of startDates) {
        for (var magnitude of FilterConstants.MagnitudeValues) {
          for (var time_unit of FilterConstants.TimeUnitValues) {
            for (var sequence of FilterConstants.SequenceValues) {
              addMilestone(Milestone.sequenceMilestone(start_date, time_unit, magnitude, direction, sequence));
            }
          }
        }
      }
    }

    sortResults();
    updateResults();
  }

  // sort, earliest date first
  function sortResults() {
    results.sort(function(a,b) {return a.end_date - b.end_date});
  }

  function wireUpFilterPanel() {
    filterPanel = new FilterPanel(updateResults);
    filterPanel.attachToElement(document.getElementById("control_panel"));
    filterPanel.addAllSubpanels(startDates);
  }

  function showEventsEditor() {
    // clear out the editing panel
    var editor = document.getElementById("editPanelInner");
    while(editor.firstChild) {
      editor.removeChild(editor.firstChild);
    }
    for (var picker of pickers) {
      picker.destroy();
    }

    function deleteEventHandler(event) {
      // Remove the element from the event editor
      var node = event.srcElement;
      node.parentNode.parentNode.removeChild(node.parentNode);
    }

    function changeEventHandler(event) {
      var node = event.srcElement;
      var row = node.parentNode;
      var labelInput = row.getElementsByClassName("editEventLabel")[0];
      var dateInput = row.getElementsByClassName("editEventDate")[0];

      // TODO: highlight date as invalid if needed
      var canary = new Date(dateInput.value);
      if (row.isNewRow && isNaN(canary) && dateInput.value.length > 0) {
        dateInput.className = "editEventDate invalid";
      } else if (!row.isNewRow && isNaN(canary)) {
        dateInput.className = "editEventDate invalid";
      } else {
        dateInput.className = "editEventDate";
      }

      if (labelInput.value.includes("?") || labelInput.value.includes("&") || labelInput.value.includes("=")) {
        labelInput.className = "editEventLabel invalid";
      } else {
        labelInput.className = "editEventLabel";
      }

      if (row.isNewRow &&
          labelInput.value != "" &&
          dateInput.value != "") {
        row.isNewRow = false; // no longer the new guy
        row.deleteButton.style.display = 'inline';
        addEventRow();
      }
    }

    // If date is not set, add a row for a possible new event.
    function addEventRow(date) {
      var row = document.createElement("div");
      row.isNewRow = !date;
      var labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.className = "editEventLabel";
        labelInput.value = date ? date.shortLabel : "";
        labelInput.placeholder = date ? date.shortLabel : "New Event";
        labelInput.onchange = changeEventHandler;
        row.appendChild(labelInput);
      var dateInput = document.createElement("input");
        dateInput.type = "text";
        dateInput.className = "editEventDate";
        dateInput.placeholder = date ? dateFormat(date.value, "mmm dS, yyyy") : "Date";
        var picker = new Pikaday({ field: dateInput });
        pickers.push(picker);
        if (date) picker.setDate(date.value);
        dateInput.onchange = changeEventHandler;
        row.appendChild(dateInput);
      var deleteButton = document.createElement("a");
        deleteButton.innerHTML = "&#10006;"
        deleteButton.className = "deleteButton";
        deleteButton.onclick = deleteEventHandler;
        deleteButton.style.display = date ? 'inline' : 'none';
        row.deleteButton = deleteButton;
        row.appendChild(deleteButton);
      editor.appendChild(row);
    }

    // add a row for each current event, and delete buttons
    for (var date of startDates) {
      addEventRow(date);
    }

    addEventRow();

    var eventsPanel = document.getElementById('events_panel');
    eventsPanel.style.display = "none";

    var editPanel = document.getElementById('editPanel');
    editPanel.style.display = "block";
  }

  // TODO
  function hideEventsEditor() {
    var eventsPanel = document.getElementById('events_panel');
    eventsPanel.style.display = "block";

    var editPanel = document.getElementById('editPanel');
    editPanel.style.display = "none";

    var newDateArray = getDateArray();

    function getDateArray() {
      var date_arr = [];
      var rows = document.getElementById("editPanelInner").children;
      for (var i=0; i<rows.length; i++) {
        var row = rows[i];
        var label = row.getElementsByClassName("editEventLabel")[0].value;
        var date = new Date(row.getElementsByClassName("editEventDate")[0].value);
        if (!isNaN(date)) {
          date_arr.push(DateConverter.toHash(date, label));
        }
      }
      return date_arr;
    }

    var oldPacking = DateConverter.packStartDates(startDates);
    var newPacking = DateConverter.packStartDates(newDateArray);
    var anyEventsChanged = oldPacking != newPacking;

    if (anyEventsChanged) {
      // update startDates array + update localStorage
      startDates = newDateArray;
      DateConverter.overwriteLocalStorageDates(newDateArray);

      // regenerate milestones+update
      generateMilestones();

      // remove events panel
      eventsPanel.parentNode.removeChild(eventsPanel);

      // regenerate events panel
      filterPanel.addSubpanel("Event", startDates, function(start_date, stone) {
        return stone.start_date === start_date;
      });
      addEditEventsLink();
    }
  }

  function addEditEventsLink() {
    // Link at the bottom of events panel to start editing
    var buttonRow = document.createElement('div');
    buttonRow.className = "buttonRow";
    var eventsPanel = document.getElementById('events_panel');
    var optionsSection = eventsPanel.getElementsByTagName('div')[0];
    var editLink = document.createElement('a');
    editLink.className = "editEventsLink pillButton";
    editLink.textContent = 'Add Events';
    editLink.onclick = showEventsEditor;
    optionsSection.appendChild(buttonRow);
    buttonRow.appendChild(editLink);
  }

  function wireUpEventsEditor() {
    // Link at the bottom of events panel to start editing
    addEditEventsLink();

    var eventsPanel = document.getElementById('events_panel');

    // Edit panel
    var editPanel = document.createElement('div');
    editPanel.id = "editPanel";
    editPanel.style.display = "none";
    var editHeader = document.createElement('h4');
    editHeader.textContent = "Edit Events";
    editHeader.className = "filterHeading";
    editPanel.appendChild(editHeader);
    var editor = document.createElement("div");
    editor.id = "editPanelInner";
    editPanel.appendChild(editor);
    eventsPanel.parentNode.insertBefore(editPanel, eventsPanel);

    // Link at bottom of edit panel to stop editing
    var buttonRow = document.createElement('div');
    buttonRow.className = "buttonRow";
    var stopEditLink = document.createElement('a');
    stopEditLink.className = "editEventsLink pillButton";
    stopEditLink.textContent = 'Done';
    stopEditLink.onclick = hideEventsEditor;
    editPanel.appendChild(buttonRow);
    buttonRow.appendChild(stopEditLink);
  }

  function showEarlierEvent() {
    console.log("show earlier not implemented yet");
    // updateResults();
  }

  function showLaterEvent() {
    console.log("show later");
    var numToReveal = 50;
    updateResults(numToReveal);
  }

  function wireUpInfinteScroll() {
    var showEarlier = document.createElement("div");
    showEarlier.id = 'earlier_results';
    showEarlier.textContent = "show earlier results";
    showEarlier.onclick = showEarlierEvent;
    resultsContainer.parentNode.insertBefore(showEarlier, resultsContainer);

    var showLater = document.createElement("div");
    showLater.id = 'later_results';
    showLater.textContent = "show later results";
    showLater.onclick = showLaterEvent;
    resultsContainer.parentNode.appendChild(showLater);
  }

  wireUpInfinteScroll();
  wireUpFilterPanel();
  wireUpEventsEditor();
  generateMilestones();
  resultsHeader.textContent = "Results"; // Shows user loading is complete.
});

