define(function(require) {

  // Imports
  var Milestone = require('Milestone');

  // Set things up
  var startDate = new Date(1983, 4, 5); // TODO - don't hardcode

  var resultsContainer = document.getElementById("results_container");
  var results = [];

  var sizes = ['small', 'big', 'giant'];
  var animals = ['cat', 'horse', 'dragon'];
  var colors = ['red', 'blue'];

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

    for (size of sizes) {
      for (animal of animals) {
        for (color of colors) {
          var res = document.createElement("p");
          var stone = new Milestone(startDate, res, size, color, animal);
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

        var br = document.createElement("br");
        subpanel.appendChild(br);
      }
    }

    addSubpanel("Size", sizes, function(size, stone) {
      return stone.size === size;
    });

    addSubpanel("Animal", animals, function(animal, stone) {
      return stone.animal === animal;
    });

    addSubpanel("Color", colors, function(color, stone) {
      return stone.color === color;
    });
  }

  wireUpInputs();
  loadDummyData();
  updateResults();  
});

