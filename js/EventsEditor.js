"use strict";
define(function(require) {

  var EventsEditor = {};

  // Imports
  var Pikaday = require('lib/pikaday/pikaday');

  // Class variables
  var pickers = [];
  var startDates;
  var DateConverter;
  var filterPanel;

  // Methods
  var generateMilestones;

  // DOM elements
  var shareSection = document.getElementById("share_section");
  var shareLink;

  // Initialization. Only called once.
  EventsEditor.initialize = function(start_dates, date_converter, gen_fn, fpanel) {
  	startDates = start_dates;
  	DateConverter = date_converter;
  	generateMilestones = gen_fn;
  	filterPanel = fpanel;

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

    initShareLink();
  }

  function initShareLink() {
    shareLink = document.createElement('a');
    shareLink.textContent = "share link";
    shareLink.onclick = showShareLink;
    shareLink.style.display = 'none';
    shareSection.appendChild(shareLink);
    updateShareLink();
  }

  function showShareLink() {
    if (shareLink.textContent == shareLink.href) {
      shareLink.textContent = 'share link';
    } else {
      shareLink.textContent = shareLink.href;
    }
    return false;
  }

  function updateShareLink() {
    var newDest = window.location.protocol + "//" +
                  window.location.host + "/" +
                  window.location.pathname + "?" +
                  DateConverter.packStartDates(startDates);
    shareLink.textContent = 'share link';
    shareLink.href = newDest;
    shareLink.style.display = startDates.length ? 'block' : 'none';
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
      var node = event.target;
      node.parentNode.parentNode.removeChild(node.parentNode);
    }

    function changeEventHandler(event) {
      var node = event.target;
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
      startDates.length = 0;
      newDateArray.forEach(function(x) {startDates.push(x);});
      DateConverter.overwriteLocalStorageDates(newDateArray);
      updateShareLink();

      // regenerate milestones+update
      generateMilestones();

      // remove events panel
      eventsPanel.parentNode.removeChild(eventsPanel);

      // regenerate events panel
      filterPanel.addSubpanel("Event", startDates, function(start_date, stone) {
        return stone.start_date === start_date;
      });
      addEditEventsLink();
    } else {
      // no events changed; don't need to do anything special here.
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

  return EventsEditor;
});