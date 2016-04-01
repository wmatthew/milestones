"use strict";
define(function(require) {

  // Imports
  var Milestone = require('Milestone');
  var FilterConstants = Milestone.getFilterConstants();
  var DateConverter = require('DateConverter');
  var FilterPanel = require('FilterPanel');

  // Set things up
  var startDates = getStartDates();
  var filterPanel;

  var resultsContainer = document.getElementById("results_container");
  var resultCount = document.getElementById("result_count");
  var resultsHeader = document.getElementById("results_header");
  var results = [];

  var htmlDownArrow = "&#9660;";
  var htmlRightArrow = "&#9654;";

  function getStartDates() {
    var dateList = [];

    function addDate(newDate) {
      // Generous dupe policy: allow different labels on same date, different dates w same label.
      if (dateList.some(function(x) {return newDate.text == x.text;})) {
        console.log("repeat date: " + newDate.text);
      } else {
        // console.log("adding start date: " + newDate.text);
        dateList.push(newDate);
      }
    }

    // dates from URL
    var search = window.location.search.substr(1);
    DateConverter.unpackStartDates(search).map(addDate);

    // dates from localStorage
    if (localStorage) {
      var events = localStorage.getItem('events');
      if (events) {
        DateConverter.unpackStartDates(events).map(addDate);
      }
    }

    // Result page doesn't look good empty. Add an event so there's something to see.
    if (dateList.length == 0) {
      DateConverter.unpackStartDates("Christmas_2016=2016-12-25").map(addDate);
    }

    if (localStorage) {
      localStorage.setItem('events', DateConverter.packStartDates(dateList));
    }

    return dateList;
  }

  // After a filter has been toggled, update results (change visibility of Milestone elts + headers)
  function updateResults() {
    var all_checkboxes = filterPanel.getAllCheckboxes();
    var visible_count = 0;
    for (var result of results) {
      result.set_visible(true);
      for (var checkbox of all_checkboxes) {
        if (!checkbox.checked && checkbox.testing_function(result)) {
          result.set_visible(false);
        }
      }
      if (result.is_visible()) {
        visible_count++;
      }
    }

    if (visible_count === results.length) {
      resultCount.textContent = "showing all " + results.length + " results";
    } else {
      resultCount.textContent = "showing " + visible_count + " of " + results.length + " results";
    }
  }

  function generateMilestones() {
    function addMilestone(stone) {
      if (stone && stone.valid) {
        var res = document.createElement("p");
        stone.attachElement(res);
        resultsContainer.appendChild(res);
        results.push(stone);
      }
    }

    // Basic numbers (1, 10, 100...) in all bases
    for (var direction of FilterConstants.DirectionValues) {
      for (var start_date of startDates) {
        for (var magnitude of FilterConstants.MagnitudeValues) {
          for (var time_unit of FilterConstants.TimeUnitValues) {
            for (var base_unit of FilterConstants.BaseValues) {
              //addMilestone(Milestone.baseMilestone(start_date, time_unit, magnitude, direction, base_unit));
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
              //addMilestone(Milestone.repeatDigitMilestone(start_date, time_unit, magnitude, direction, repeat));
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
              //addMilestone(Milestone.prefixTwoMilestone(start_date, time_unit, magnitude, direction, prefix));
            }
          }
        }
      }
    }

    // TODO: Possible future additions:
    // Sequences:          123, 1234, 12345, ... 54321, ...
  }

  function sortEvent(event) {
    var src = event.srcElement;
    sortResults(src);
  }

  // sort by date or by weight
  function sortResults(src) {
    src = src || document.getElementById("date_link");
    var by_date = src.by_date;
    src.className = "inactive";
    src.otherLink.className = "";

    // remove everything
    while(resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }

    // sort
    if (by_date) {
      // earliest date first
      results.sort(function(a,b) {return a.end_date - b.end_date});
    } else {
      // highest weight first
      results.sort(function(a,b) {return b.weight - a.weight});
    }

    // add back in, in order
    for (var result of results) {
      resultsContainer.appendChild(result.html_element);
    }
    return false;
  }

  function wireUpSortLinks() {
    var date_link = document.createElement("a");
    var best_link = document.createElement("a");

    var date_label = document.createTextNode("date");
    date_link.appendChild(date_label);
    date_link.id = "date_link";
    date_link.onclick = sortEvent;
    date_link.by_date = true;
    date_link.otherLink = best_link;

    var best_label = document.createTextNode("best match");
    best_link.appendChild(best_label);
    best_link.onclick = sortEvent;
    best_link.by_date = false;
    best_link.otherLink = date_link;

    var sortContainer = document.getElementById("sort_links");
    sortContainer.appendChild(document.createTextNode("Sort by "));
    sortContainer.appendChild(date_link);
    sortContainer.appendChild(document.createTextNode(" / "));
    sortContainer.appendChild(best_link);
  }

  function wireUpInputs() {
    filterPanel = new FilterPanel(updateResults);
    filterPanel.attachToElement(document.getElementById("control_panel"));
    filterPanel.addAllSubpanels(startDates);
  }

  // TODO
  function showEventsEditor() {
    // clear out the editing panel
    var editor = document.getElementById("editPanelInner");
    while(editor.firstChild) {
      editor.removeChild(editor.firstChild);
    }

    // add a row for each current event, and delete buttons
    for (var date of startDates) {
      var row = document.createElement("div");
       var deleteButton = document.createElement("a");
        deleteButton.innerHTML = "&#10006;"
        deleteButton.className = "deleteButton";
        row.appendChild(deleteButton);
       row.appendChild(document.createTextNode(date.text));
      editor.appendChild(row);
    }

    // add a row for a possible new event, and an add button
    var row = document.createElement("div");
     row.appendChild(document.createTextNode("New Event"));
    editor.appendChild(row);

    var eventsPanel = document.getElementById('events_panel');
    eventsPanel.style.display = "none";

    var editPanel = document.getElementById('editPanel');
    editPanel.style.display = "block";
  }

  // TODO
  function hideEventsEditor() {
    // if events have changed / been added, save the changes

    // clear out the events panel

    // regenerate the events panel

    var eventsPanel = document.getElementById('events_panel');
    eventsPanel.style.display = "block";

    var editPanel = document.getElementById('editPanel');
    editPanel.style.display = "none";
  }

  // TODO: finish implementing
  function wireUpEventsEditor() {
    // Link at the bottom of events panel to start editing
    var eventsPanel = document.getElementById('events_panel');
    var optionsSection = eventsPanel.getElementsByTagName('div')[0];
    var editLink = document.createElement('a');
    editLink.className = "editEventsLink";
    editLink.textContent = '+ Add / Edit Events';
    editLink.onclick = showEventsEditor;
    optionsSection.appendChild(editLink);

    // Edit panel
    var editPanel = document.createElement('div');
    editPanel.id = "editPanel";
    editPanel.style.display = "none";
    var editHeader = document.createElement('h4');
    editHeader.textContent = "Edit Events";
    editPanel.appendChild(editHeader);
    var editor = document.createElement("div");
    editor.id = "editPanelInner";
    editPanel.appendChild(editor);
    eventsPanel.parentNode.insertBefore(editPanel, eventsPanel);

    // Link at bottom of edit panel to stop editing
    var stopEditLink = document.createElement('a');
    stopEditLink.className = "editEventsLink";
    stopEditLink.textContent = 'Done';
    stopEditLink.onclick = hideEventsEditor;
    editPanel.appendChild(stopEditLink);
  }

  wireUpInputs();
  wireUpSortLinks();
  wireUpEventsEditor();
  generateMilestones();
  sortResults();
  updateResults();
  resultsHeader.textContent = "Results"; // Informs user loading is complete.
});

