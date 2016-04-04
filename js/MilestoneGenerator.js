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
  var regenerating = false;

  // DOM elements
  var resultsContainer = document.getElementById("results_container");
  var resultsHeader = document.getElementById("results_header");
  var resultCount = document.getElementById("result_count");
  var loadingCount;

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

  function initialClean() {
    clearOldMilestones();
    resultsHeader.textContent = "Loading...";
    document.getElementById("earlier_results").style.display = 'none';
    document.getElementById("later_results").style.display = 'none';
    resultCount.textContent = "";
  }

  MilestoneGenerator.isBusy = function() {
    return regenerating;
  }

  MilestoneGenerator.generate = function(updateMethod) {
    if (regenerating) {
      console.log("warn - tried to regenerate when already regenerating");
      return;
    }
    regenerating = true;

    asyncChain([
      initialClean,
      startLoadingProgress,
      generateRepeats,
      generateTwoPrefixes,
      generateOnePrefixes,
      generatePowersOfTen,
      generateSequences,
      sortGeneratedResults,
      clearResultsContainer,
      reportCompletion,
      updateMethod,
      ]);
  }

  function sortGeneratedResults() {
    showLoadingUpdate("Sorting");
    results.sort(function(a,b) {return a.end_date - b.end_date}); // earliest date first
  }

  function asyncChain(functions) {
    var func = functions.shift();
    if (func) {
      setTimeout(function() {
        func.call();
        asyncChain(functions);
      }, 200);
    }
  }

  function reportCompletion() {
    console.log("Generated " + results.length + " milestones.");
    resultsHeader.textContent = "Results";
    regenerating = false;
  }

  // Sequences: (12345, 54321). base 10 only.
  function generateSequences() {
    showLoadingUpdate("Generating Sequences");
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
    showLoadingUpdate("Generating Round Numbers");
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
    showLoadingUpdate("Generating Very Round Numbers");
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
    showLoadingUpdate("Generating Repeating Numbers");
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
    showLoadingUpdate("Generating Powers of Ten");
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

  function startLoadingProgress() {
    loadingCount = document.createElement("div");
    updateLoadingCount();
    resultsContainer.appendChild(loadingCount);

    // TODO: show spinner
  }

  function updateLoadingCount() {
    loadingCount.textContent = results.length + " milestones";
  }

  function showLoadingUpdate(message) {
    //console.log("Loading: " + message);
    var msg = document.createElement("div");
    msg.textContent = message + '...';
    resultsContainer.appendChild(msg);
    updateLoadingCount();
  }

  return MilestoneGenerator;
});