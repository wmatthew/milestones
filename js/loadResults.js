// Imports
// var Milestone = require('./Milestone.js').Milestone;

// Set things up
var startDate = new Date(1983, 4, 5); // TODO - don't hardcode

var resultsContainer = document.getElementById("results_container");
var results = [];

function updateResults() {
  console.log("Updating Results");

  var hide_cats = !document.getElementById("check_cats").checked;
  var hide_dogs = !document.getElementById("check_dogs").checked;
  var hide_red  = !document.getElementById("check_red").checked;
  var hide_blue = !document.getElementById("check_blue").checked;

  for (result of results) {
    result.style.display = "block";

    if (hide_cats && result.animal == 'cat') {
      result.style.display = "none";
    }

    if (hide_dogs && result.animal == 'dog') {
      result.style.display = "none";
    }

    if (hide_red && result.color == 'red') {
      result.style.display = "none";
    }

    if (hide_blue && result.color == 'blue') {
      result.style.display = "none";
    }
  }
}

function loadDummyData() {
  var sizes = ['small', 'big'];
  var animals = ['cat', 'dog', 'mouse'];
  var colors = ['red', 'green', 'blue'];

  for (size of sizes) {
    for (animal of animals) {
      for (color of colors) {
        // var Milestone = new Milestone(startDate, time_unit, time_number, blank_html_element);
        var res = document.createElement("p");
        var text = document.createTextNode([size, color, animal].join());
        res.appendChild(text);
        res.size = size;
        res.animal = animal;
        res.color = color;
        results.push(res);
        resultsContainer.appendChild(res);        
      }
    }
  }
}

function wireUpInputs() {
  document.getElementById("check_odds").onchange = updateResults;
  document.getElementById("check_evens").onchange = updateResults;
  document.getElementById("check_small").onchange = updateResults;
}

wireUpInputs();
loadDummyData();
updateResults();
