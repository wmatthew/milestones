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
    setTimeout(hideRepeatedHeaders, 0);
    setTimeout(fixPartials, 0);
    setTimeout(updateVisibleCount, 0);
  }

  // If multiple milestones share a header, hide the all but the first instance. This makes the
  // results for that day look like a contiguous block.
  function hideRepeatedHeaders() {
    var previousVisibleHeader = false;
    for (var result of results) {
      if (result.is_visible()) {
        var currentElementHeader = result.html_element.firstChild;
        var repeatHeader = previousVisibleHeader && (currentElementHeader.textContent == previousVisibleHeader.textContent);
        if (repeatHeader && currentElementHeader.style.display == 'block') console.log('hide repeat header');
        currentElementHeader.style.display = repeatHeader ? 'none' : 'block';
        previousVisibleHeader = currentElementHeader;
      }
    }
  }

  // If a day has multiple (unfiltered) milestones, make sure we're showing
  // all or none of them.
  function fixPartials() {
    var groupHeaderText = false;
    var group = [];
    var previousElement = false;

    for (var result of results) {
      var showable = !isHiddenByFilters(result);
      if (showable) {
        var currentHeaderText = result.getHeaderText();
        if (currentHeaderText == groupHeaderText) {
          group.push(result);
        } else {
          // process old group
          var anyVisible = group.some(function(r) {return r.is_visible();});
          if (anyVisible) {
            group.forEach(function(r){
              // create if needed
              if (!r.html_element) {
                //console.log("fixPartials: add 1");
                var resNode = r.getOrCreateElement(resNode);
                // TODO: adding in wrong order??
                insertAfterChild(resultsContainer, previousElement, r.html_element);
              }
              r.set_visible(true);
            });
          }

          // set up new group
          group.length = 0;
          group.push(result);
          groupHeaderText = currentHeaderText;
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
  }

  return AsyncCleaners;
});