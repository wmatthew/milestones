define(function(require) {

  // Imports
  var Milestone = require('Milestone');

  // Set things up
  var startDate = new Date(1983, 4, 5); // TODO - don't hardcode

  var resultsContainer = document.getElementById("results_container");
  var results = [];

  var all_checkboxes = [];

  function updateResults() {
    for (result of results) {
      result.set_visible(true);
      for (checkbox of all_checkboxes) {
        if (!checkbox.checked && checkbox.testing_function(result)) {
          result.set_visible(false);
        }
      }
    }
    console.log("Results updated.");
  }

  function loadDummyData() {
    for (time_value of Milestone.TimeValueValues) {
      for (time_unit of Milestone.TimeUnitValues) {
        for (base_unit of Milestone.BaseUnitValues) {
          var res = document.createElement("p");
          var stone = new Milestone(startDate, res, time_unit, base_unit, time_value);
          resultsContainer.appendChild(res);        
          results.push(stone);
        }
      }
    }
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
        checkbox.onchange = updateResults;
        checkbox.testing_function = test_function.bind(undefined, option);
        subpanel.appendChild(checkbox);
        all_checkboxes.push(checkbox);

        var label = document.createElement("span");
        label.innerHTML = option;
        subpanel.appendChild(label);

        subpanel.appendChild(document.createElement("br"));
      }
    }

    addSubpanel("Start Date", [startDate], function(start_date, stone) {
      return stone.start_date === start_date;
    });

    addSubpanel("Time Unit", Milestone.TimeUnitValues, function(time_unit, stone) {
      return stone.time_unit === time_unit;
    });

    addSubpanel("Base Unit", Milestone.BaseUnitValues, function(base_unit, stone) {
      return stone.base_unit === base_unit;
    });

    addSubpanel("Time Value", Milestone.TimeValueValues, function(time_value, stone) {
      return stone.time_value === time_value;
    });
  }

  wireUpInputs();
  loadDummyData();
  updateResults();  
});

