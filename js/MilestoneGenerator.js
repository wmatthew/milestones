"use strict";
define(function(require) {
  // This class generates lots of Milestones.

  // Imports
  var Milestone = require('Milestone');
  var FilterConstants = Milestone.getFilterConstants();

	// The static class
  var MilestoneGenerator = {};

  // Class variables
  var results;
  var startDates;

  // DOM elements
  var resultsContainer = document.getElementById("results_container");
  var resultsHeader = document.getElementById("results_header");

  MilestoneGenerator.initialize = function(res_arr, start_dates) {
    results = res_arr;
    startDates = start_dates;
  }

  function addMilestone(stone) {
    if (stone && stone.valid) {
      results.push(stone);
    }
  }

  // Clear existing milestones (results) and DOM elements
  function clearOldMilestones() {
    clearResultsContainer();
    results.length = 0;
  }

  // Clear messages from MilestoneGenerator / DOM elements from past Milestones
  function clearResultsContainer() {
    while(resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }
  }

  MilestoneGenerator.generate = function() {
    asyncChain([
      clearOldMilestones,
      generateSequences,
      generateRepeats,
      generateOnePrefixes,
      generateTwoPrefixes,
      generatePowersOfTen,
      reportCompletion,
      clearResultsContainer,
      ]);
  }

  function asyncChain(functions) {
    for (var func of functions) {
      func.call();
    }
  }

  function reportCompletion() {
    console.log("Generated " + results.length + " milestones.");
    resultsHeader.textContent = "Results"; // replaces 'loading...'
  }

  // Sequences: (12345, 54321). base 10 only.
  function generateSequences() {
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
  }

  // Two leading digits: (12000, 13000, 14000). base 10 only.
  function generateTwoPrefixes() {
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
  }

  // One leading digit: (2000, 3000, 4000). base 10 only.
  function generateOnePrefixes() {
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
  }

  // Repeated digits (111, 222, 333 ...) base 10 only
  function generateRepeats() {
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
  }

  // Basic numbers (1, 10, 100...) in all bases
  function generatePowersOfTen() {
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
  }

  // function startLoadingProgress() {
  //   // TODO
  // }

  function showLoadingUpdate(message) {
    var msg = document.createElement("div");
    msg.textContent = message;
    resultsContainer.appendChild(msg);
  }

  return MilestoneGenerator;
});