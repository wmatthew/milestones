"use strict";
define(function(require) {

  // Imports
  require('BasicUtils');
  var Milestone = require('Milestone');
  var DateConverter = require('DateConverter');
  var FilterPanel = require('FilterPanel');
  var InfiniteScroll = require('InfiniteScroll');
  var MilestoneGenerator = require('MilestoneGenerator');
  var EventsEditor = require('EventsEditor');

  // Vars
  var startDates;
  var filterPanel;
  var results = [];

  // Generate new milestones and do all appropriate followup.
  function generateMilestones() {
    MilestoneGenerator.generate(InfiniteScroll.updateResults);
  }

  function wireUpFilterPanel() {
    filterPanel = new FilterPanel(InfiniteScroll.updateResults);
    filterPanel.attachToElement(document.getElementById("control_panel"));
    filterPanel.addAllSubpanels(startDates);
  }

  // Initialization
  startDates = DateConverter.getStartDates();
  wireUpFilterPanel();
  InfiniteScroll.wireUpInfiniteScroll();

  EventsEditor.initialize(startDates, DateConverter, generateMilestones, filterPanel);
  MilestoneGenerator.initialize(results, startDates);
  InfiniteScroll.initialize(results, filterPanel, MilestoneGenerator.isBusy);

  generateMilestones();
  // previous call was async, so be careful adding stuff here.

});

