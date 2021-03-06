"use strict";
define(function(require) {

  // Helpful functions that clean up the results list.
  // These are done asynchronously so they don't block the UI.
  //
  // TODO: perf test async vs serial

	// The static class
  var AsyncCleaners = {};

  // Class variables
  var results;

  // Methods
  var isHiddenByFilters;

  // DOM nodes
  var resultCount = document.getElementById("result_count");
  var resultsContainer = document.getElementById("results_container");

  // Initialization. Should be repeatable.
  AsyncCleaners.initialize = function(results_arr, hidden_fn) {
  	results = results_arr;
    isHiddenByFilters = hidden_fn;
  }

  AsyncCleaners.cleanUp = function() {
    setTimeout(function() {
      fixPartials();
      hideRepeatedHeaders();
      updateVisibleCount();
      showOrHideMoreButtons();
    }, 0);
  }

  // Show 'show earlier'/'show more' buttons only when there's more to see.
  // Also unhook the onscroll event if there's not more to see.
  function showOrHideMoreButtons() {
    var seenVisibleYet = false;
    var hiddenEarlyResultsCount = 0;
    var hiddenLateResultsCount = 0;

    for (var result of results) {
      var visible = result.is_visible();
      if (visible) {
        seenVisibleYet = true;
      }
      if (!isHiddenByFilters(result) && !visible) {
        if (!seenVisibleYet) {
          // hidden results that are before the first visible result.
          hiddenEarlyResultsCount++;
        } else {
          // these late results might not actually be after the last visible entry, but that's okay.
          // the 'show more' button at the end also serves to fill in gaps.
          hiddenLateResultsCount++;
        }
      }
    }

    console.log("Hidden Counts: " + hiddenEarlyResultsCount + ", " + hiddenLateResultsCount);

    var earlierElt = document.getElementById("earlier_results");
    var laterElt = document.getElementById("later_results");
    earlierElt.style.display = hiddenEarlyResultsCount ? 'block' : 'none';
    laterElt.style.display = hiddenLateResultsCount ? 'block' : 'none';
  }

  // If multiple milestones share a header, hide the all but the first instance. This makes the
  // results for that day look like a contiguous block.
  function hideRepeatedHeaders() {
    var previousVisibleHeader = false;
    for (var result of results) {
      if (result.is_visible()) {
        var currentElementHeader = result.html_element.firstChild;
        var repeatHeader = previousVisibleHeader && (currentElementHeader.textContent == previousVisibleHeader.textContent);
        // if (repeatHeader && currentElementHeader.style.display == 'block') console.log('hide repeat header'); // debug
        currentElementHeader.style.display = repeatHeader ? 'none' : 'block';
        previousVisibleHeader = currentElementHeader;
      }
    }
  }

  // If we're showing any milestones for a day, make sure we show all milestones for that day
  // (not counting ones hidden by filters)
  function fixPartials() {
    // The 'zone' we're tracking is the range of milestones with identical headers.
    var currentZoneText = false;
    var currentZoneVisible = false;
    var previousElement = false;

    for (var i=0; i<results.length; i++) {
      var result = results[i];
      var showable = !isHiddenByFilters(result);
      if (showable) {
        var resHeadText = result.getHeaderText();
        if (currentZoneText == resHeadText) {
          if (currentZoneVisible) {
            if (!result.html_element) {
              var resNode = result.getOrCreateElement();
              insertAfterChild(resultsContainer, previousElement, result.html_element);
            }
            result.set_visible(true);
          }
        } else {
          currentZoneText = resHeadText;
          currentZoneVisible = false;
          for (var j=i+1; j<results.length; j++) {
            var nextResult = results[j];
            var nextHeadText = nextResult.getHeaderText();
            if (nextHeadText != currentZoneText) {
              break;
            } else if (nextResult.is_visible()) {
              currentZoneVisible = true;
              break;
            }
          }
        }
      }
      // end-of-loop bookkeeping
      if (result.html_element) {
        previousElement = result.html_element;
      }
    }

    // TODO: defined in 2 places. consolidate, move to a util class
    function insertAfterChild(parent, sibling, newNode) {
      if (sibling) {
        parent.insertBefore(newNode, sibling.nextSibling);
      } else {
        parent.appendChild(newNode);
      }
    }

  }

  // Update the count at the top of the results list.
  function updateVisibleCount() {
    var visible_count = 0;
    for (var result of results) {
      if (result.is_visible()) visible_count++;
    }

    if (visible_count === results.length) {
      resultCount.textContent = "showing all " + results.length + " results";
    } else {
      resultCount.textContent = visible_count + " shown (" + results.length + " total)";
    }
    console.log("Now showing " + visible_count + " / " + results.length);
  }

  return AsyncCleaners;
});