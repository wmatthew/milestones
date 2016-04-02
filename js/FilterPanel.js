"use strict";
define(function(require) {

  // Imports
  var Milestone = require('Milestone');
  var FilterConstants = Milestone.getFilterConstants();

  // TODO: consolidate in an HTML constants class
  var htmlDownArrow = "&#9660;";
  var htmlRightArrow = "&#9654;";

  function FilterPanel(updateResults) {
  	this.updateResults = updateResults;
    this.all_checkboxes = [];
  }

  FilterPanel.prototype = {
  	constructor: FilterPanel,

    attachToElement: function(node) {
	  	this.panel = node;
	  },

	  getAllCheckboxes: function() {
      return this.all_checkboxes;
	  },

	  addAllSubpanels: function(startDates) {
	    this.addSubpanel("Event", startDates, function(start_date, stone) {
	      return stone.start_date === start_date;
	    });

	    this.addSubpanel("Type", FilterConstants.KindValues, function(kind,stone){
	      return stone.kind === kind;
	    });

	    this.addSubpanel("Time Unit", FilterConstants.TimeUnitValues, function(time_unit, stone) {
	      return stone.time_unit === time_unit;
	    });

	    // TODO: Make it a slider?
	    this.addSubpanel("Length", FilterConstants.MagnitudeValues, function(magnitude, stone) {
	      return stone.magnitude === magnitude;
	    });

	    this.addSubpanel("Base", FilterConstants.BaseValues, function(base_unit, stone) {
	      return stone.base_unit === base_unit;
	    });

	    this.addSubpanel("Repeated Digit", FilterConstants.RepeatingDigitValues, function(repeat, stone) {
	      return stone.repeat.value === repeat.value;
	    });

	    this.addSubpanel("Past / Future", FilterConstants.EraValues, function(era, stone) {
	      return stone.era.value === era.value;
	    });

	    this.addSubpanel("Before / After Event", FilterConstants.DirectionValues, function(direction, stone) {
	      return stone.direction_value.value === direction.value;
	    });
	  },

		addSubpanel: function(heading, options, test_function) {
	    var subpanel = document.createElement("div");
	    if (heading == "Event") {
	    	subpanel.id = "events_panel";
	      this.panel.insertBefore(subpanel, this.panel.firstChild); // Events always goes first
	    } else {
	      this.panel.appendChild(subpanel);
	    }

	    var head = document.createElement("h4");
	    var headTitle = document.createElement("span");
	    headTitle.className = "noselect filterHeading";
	    headTitle.textContent = heading;

	    var optionsSection = document.createElement("div");
	    optionsSection.className = "optionsSection";

	    var collapseIcon = document.createElement("span");
	    collapseIcon.innerHTML = htmlDownArrow + " ";

	    var collapseLink = document.createElement("a");
	    collapseLink.sectionHidden = false;
	    collapseLink.className = "collapseLink noselect";
	    collapseLink.onclick = toggleOptionSectionEvent;
	    collapseLink.arrow = collapseIcon;
	    collapseLink.targetSection = optionsSection;

	    var allLink = document.createElement("a");
	    allLink.textContent = "all";
	    allLink.className = "allLink";
	    allLink.onclick = checkAllHandler;
	    allLink.updateResults = this.updateResults;
	    allLink.targetSection = optionsSection;

	    subpanel.appendChild(head);
	      head.appendChild(collapseLink);
	        collapseLink.appendChild(collapseIcon);
	        collapseLink.appendChild(headTitle);
	      head.appendChild(allLink);
	    subpanel.appendChild(optionsSection);

	    for (var option of options) {
	      var checkbox = document.createElement("input");
	      checkbox.type = "checkbox";
	      checkbox.checked = true;
	      if (option.text == "past") checkbox.checked = false;
	      checkbox.onchange = this.updateResults;
	      checkbox.testing_function = test_function.bind(undefined, option);
	      optionsSection.appendChild(checkbox);
	      this.all_checkboxes.push(checkbox);

	      var label = document.createTextNode(getLabel(options, option));
	      optionsSection.appendChild(label);

	      var onlyLink = document.createElement("a");
	      onlyLink.textContent = "only";
	      onlyLink.className = "onlyLink";
	      onlyLink.onclick = onlyThisOptionHandler;
	      onlyLink.updateResults = this.updateResults;
	      onlyLink.targetSection = optionsSection;
	      onlyLink.targetLink = checkbox;
	      optionsSection.appendChild(onlyLink);

	      optionsSection.appendChild(document.createElement("br"));
	    }

	    function checkAllHandler(event) {
		    var node = event.srcElement;
		    var checkBoxes = node.targetSection.getElementsByTagName("input");
		    for (var i=0; i<checkBoxes.length; i++) {
		      var child = checkBoxes[i];
		      child.checked = true;
		    }
		    this.updateResults();
		  }

		  function onlyThisOptionHandler(event) {
		    var node = event.srcElement;
		    var checkBoxes = node.targetSection.getElementsByTagName("input");
		    for (var i=0; i<checkBoxes.length; i++) {
		      var child = checkBoxes[i];
		      child.checked = false;
		    }
		    node.targetLink.checked = true;
		    this.updateResults();
		  }
	  },
  }

  // Get the display label to show next to the checkbox.
  function getLabel(optionList, option) {
    if (optionList === FilterConstants.KindValues) {
      return option.text + " (" + option.example+ ")";
    } else if (optionList === FilterConstants.MagnitudeValues) {
      if (option.shortLabel) {
        return (option.exponent+1) + " (" + option.shortLabel + ")";
      } else {
        return (option.exponent+1);
      }
    } else {
      return option.text;
    }
  }

  // show or hide one section
  function toggleOptionSectionEvent(event) {
    var node = event.srcElement.parentNode;
    toggleOptionSection(node);
    return false;
  }

  function toggleOptionSection(node) {
    if (node.sectionHidden) {
      node.sectionHidden = false;
      node.arrow.innerHTML = htmlDownArrow + " ";
      node.targetSection.style.display = "block";
    } else {
      node.sectionHidden = true;
      node.arrow.innerHTML = htmlRightArrow + " ";
      node.targetSection.style.display = "none";
    }
  }

  return FilterPanel;
});