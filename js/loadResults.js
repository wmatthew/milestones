define(function(require) {

  // Imports
  var Milestone = require('Milestone');

  // Set things up
  var startDate = getStartDate();

  var resultsContainer = document.getElementById("results_container");
  var resultCount = document.getElementById("result_count");
  var results = [];

  var all_checkboxes = [];

  // TODO
  function getStartDate() {
    date = new Date(1982, 8, 6);
    return {
      value: date,
      text: dateFormat(date, "mmmm dS, yyyy")
    };
  }

  function updateResults() {
    for (result of results) {
      result.set_visible(true);
      for (checkbox of all_checkboxes) {
        if (!checkbox.checked && checkbox.testing_function(result)) {
          result.set_visible(false);
        }
      }
    }
    resultCount.textContent = results.length + " results";
    console.log("Results updated.");
  }

  function loadDummyData() {
    for (time_value of Milestone.TimeValueValues) {
      for (time_unit of Milestone.TimeUnitValues) {
        for (base_unit of Milestone.BaseUnitValues) {
          var res = document.createElement("p");
          var stone = new Milestone(startDate, res, time_unit, base_unit, time_value);
          if (stone.valid) {
            resultsContainer.appendChild(res);
            results.push(stone);
          }
        }
      }
    }
  }

  // sort by date or by weight
  function sortResults(by_date) {
    while(resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }
    // sort
    if (by_date) {
      console.log("Sorting by date.");
      results.sort(function(a,b) {return a.end_date - b.end_date});
    } else {
      console.log("Sorting by best match.");
      results.sort(function(a,b) {return b.weight - a.weight});
    }

    for (result of results) {
      resultsContainer.appendChild(result.html_element);
    }
  }

  function wireUpSortLinks() {
    var date_link = document.createElement("a");
    var date_label = document.createTextNode("sort by date");
    date_link.appendChild(date_label);
    date_link.onclick = function() { sortResults(true); return false; };

    var best_link = document.createElement("a");
    var best_label = document.createTextNode("sort by best match");
    best_link.appendChild(best_label);
    best_link.onclick = function() { sortResults(false); return false; };

    var sortContainer = document.getElementById("sort_links");
    sortContainer.appendChild(date_link);
    sortContainer.appendChild(document.createTextNode(" ... "));
    sortContainer.appendChild(best_link);
  }

  function wireUpInputs() {
    var panel = document.getElementById("control_panel");

    function addSubpanel(heading, options, test_function) {
      var subpanel = document.createElement("div");
      panel.appendChild(subpanel);

      var head = document.createElement("h4");
      head.innerHTML = heading;
      subpanel.appendChild(head);

      for (option of options) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        if (option.text == "past") checkbox.checked = false;
        checkbox.onchange = updateResults;
        checkbox.testing_function = test_function.bind(undefined, option);
        subpanel.appendChild(checkbox);
        all_checkboxes.push(checkbox);

        var label = document.createTextNode(option.text);
        subpanel.appendChild(label);

        subpanel.appendChild(document.createElement("br"));
      }
    }

    addSubpanel("Start Date", [startDate], function(start_date, stone) {
      return stone.start_date === start_date;
    });

    addSubpanel("Number", Milestone.TimeValueValues, function(time_value, stone) {
      return stone.time_value === time_value;
    });

    addSubpanel("Unit", Milestone.TimeUnitValues, function(time_unit, stone) {
      return stone.time_unit === time_unit;
    });

    addSubpanel("Base", Milestone.BaseUnitValues, function(base_unit, stone) {
      return stone.base_unit === base_unit;
    });

    addSubpanel("Milestone", Milestone.EraValues, function(era, stone) {
      return stone.era === era;
    });
  }

  wireUpInputs();
  wireUpSortLinks();
  loadDummyData();
  updateResults();
  sortResults(true);
});

