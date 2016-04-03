"use strict";
define(function(require) {

  // Helpful functions that clean up the results list.
  // These are done asynchronously so they don't block the UI.
  //
  // TODO: perf test async vs serial - is this helping much?

	// The static class
  var AsyncCleaners = {};

  // Class variables
  var results;

  // DOM nodes
  var resultCount = document.getElementById("result_count");

  // Initialization. Should be repeatable.
  AsyncCleaners.initialize = function(results_arr) {
  	results = results_arr;
  }

  // If multiple milestones share a header, hide the all but the first instance. This makes the
  // results for that day look like a contiguous block.
  AsyncCleaners.hideRepeatedHeaders = function() {
    setTimeout(function() {
      var previousVisibleHeader = false;
      for (var result of results) {
        if (result.is_visible()) {
          var currentElementHeader = result.html_element.firstChild;
          var repeatHeader = previousVisibleHeader && (currentElementHeader.textContent == previousVisibleHeader.textContent);
          currentElementHeader.style.display = repeatHeader ? 'none' : 'block';
          previousVisibleHeader = currentElementHeader;
        }
      }
    }, 0);
  }

  // Update the count at the top of the results list.
  AsyncCleaners.updateVisibleCount = function() {
    setTimeout(function() {
      var visible_count = 0;
      for (var result of results) {
        if (result.is_visible()) visible_count++;
      }

      if (visible_count === results.length) {
        resultCount.textContent = "showing all " + results.length + " results";
      } else {
        resultCount.textContent = visible_count + " shown (" + results.length + " total)";
      }
    }, 0);
  }

  return AsyncCleaners;
});