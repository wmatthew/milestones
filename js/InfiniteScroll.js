"use strict";
define(function(require) {

	// Imports
  var AsyncCleaners = require('AsyncCleaners');

	// The static class
  var InfiniteScroll = {};

  // Class variables
  var results;
  var AsyncCleaners;
  var earliestShown;

  // Functions
  var showEarlierNode;
  var filterPanel;
  var generatorIsBusy;

  // DOM nodes
  var resultsContainer = document.getElementById("results_container");

  // Initialization. Should be repeatable.
  InfiniteScroll.initialize = function(results_arr, fpanel, is_busy) {
  	results = results_arr;
  	filterPanel = fpanel;
    generatorIsBusy = is_busy;

  	earliestShown = new Date();
    earliestShown.setHours(0,0,0,0);
  	AsyncCleaners.initialize(results, InfiniteScroll.isHiddenByFilters);
  };

  InfiniteScroll.isHiddenByFilters = function(result) {
    var all_checkboxes = filterPanel.getAllCheckboxes();
    for (var checkbox of all_checkboxes) {
      if (!checkbox.checked && checkbox.testing_function(result)) {
        return true;
      }
    }
    return false;
  };

  //================================================================================================
  // Show Later Async

  // After a filter has been toggled, update results (change visibility of Milestone elts + headers)
  InfiniteScroll.updateResults = function(numToReveal) {
    if (generatorIsBusy()) {
      console.log("skipping update - generator is busy right now.");
      return;
    }

    numToReveal = numToReveal ||  0;
    var all_checkboxes = filterPanel.getAllCheckboxes();
    var visible_count = 0; // number of user-visible results
    var found_count = 0; // max the user could see with these filter options
    var newly_revealed = 0;

    var minResultsShown = 50;
    var previousElement = false;

    for (var result of results) {
      var filterVisible = !InfiniteScroll.isHiddenByFilters(result);
      var afterStart = result.end_date >= earliestShown;
      var showMore = visible_count < minResultsShown;
      var revealMore = newly_revealed < numToReveal;

      if (filterVisible && afterStart && (showMore || revealMore)) {
        if (!result.is_visible()) {
          newly_revealed ++;
        }
        if (!result.html_element) {
          var resNode = result.getOrCreateElement();
          insertAfterChild(resultsContainer, previousElement, result.html_element);
        }
        visible_count++;
      }

      // end-of-loop bookkeeping
      result.set_visible(filterVisible);
      if (filterVisible) found_count ++;
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

    // post-loop bookkeeping
    AsyncCleaners.cleanUp();
  };

  //================================================================================================
  // Event handling functions

  function showEarlierEvent(event) {
    showEarlierNode(event.currentTarget);
  }

  function showLaterEvent(event) {
    showLaterNode(event.currentTarget);
  }

  function showEarlierNode(node) {
    node.spin();
    setTimeout(function() {
      showEarlierAsync();
      node.stop();
    }, 0);
  }

  function showLaterNode(node) {
    console.log("show more...");
    node.spin();
    var numToReveal = 50;
    setTimeout(function() {
      InfiniteScroll.updateResults(numToReveal);
      node.stop();
    }, 0);
  }
  //================================================================================================
  // Show Earlier Async
  function showEarlierAsync() {
    var numToReveal = 10; // TODO: change this to reveal one month's worth of events?
    var newly_revealed = 0;
    var previousElement = false; // temporally before, but lower in display order

    for (var i=results.length-1; i>=0; i--) {
      var result = results[i];

      var earlySection = result.end_date < earliestShown;
      var showable = !InfiniteScroll.isHiddenByFilters(result);
      var show_more = newly_revealed < numToReveal;
      var hidden = !result.is_visible();

      if (earlySection && showable && hidden && show_more) {
        if (!result.html_element) {
          var resNode = result.getOrCreateElement();
          insertBeforeSibling(resultsContainer, previousElement, resNode);
        }
        result.set_visible(true);
        newly_revealed++;
      }

      // end-of-loop bookkeeping
      if (result.html_element) {
        previousElement = result.html_element;
      }
    }

    // post-loop bookkeeping
    AsyncCleaners.cleanUp();

    // TODO: move to HTML util class
    function insertBeforeSibling(parent, sibling, newNode) {
      if (sibling) {
        parent.insertBefore(newNode, sibling);
      } else {
        parent.insertBefore(newNode, parent.firstChild);
      }
    }
  }

  //================================================================================================
  // Run before initialization
  InfiniteScroll.wireUpInfiniteScroll = function() {
    var showEarlier = document.createElement("div");
    showEarlier.id = 'earlier_results';
    showEarlier.style.display = 'none';
    showEarlier.onclick = showEarlierEvent;
    addLabelAndSpinner(showEarlier, "show earlier results");
    resultsContainer.parentNode.insertBefore(showEarlier, resultsContainer);

    var showLater = document.createElement("div");
    showLater.id = 'later_results';
    showLater.style.display = 'none';
    showLater.onclick = showLaterEvent;
    addLabelAndSpinner(showLater, "show more results");
    resultsContainer.parentNode.appendChild(showLater);

    function isVisible(elem) {
      if (elem.style.display == 'none') return false;
      var windowBottom = window.scrollY + window.innerHeight;
      var margin = 600;
      var eltPos = elem.offsetTop - margin;
      return windowBottom > eltPos;
    }

    window.onscroll = function() {
      if (isVisible(showLater)) {
        showLaterNode(showLater);
      }
    }
  };

  function addLabelAndSpinner(elt, labelText) {
    var label = document.createElement("p");
    label.textContent = labelText;
    elt.appendChild(label);

    var spinner = getSpinner();
    elt.appendChild(spinner);

    elt.spin = function() {
      label.style.display = "none";
      spinner.style.display = "block";
    }

    elt.stop = function() {
      label.style.display = "block";
      spinner.style.display = "none";
    }

    elt.stop();
  };

  // Get a CSS-only spinner element
  function getSpinner() {
    var spin = document.createElement("div");
    spin.className = "sk-circle";
    for (var i=1; i<=12; i++) {
      var dot = document.createElement("div");
      dot.className = "sk-child sk-circle" + i;
      spin.appendChild(dot);
    }
    return spin;
  }

  return InfiniteScroll;
});