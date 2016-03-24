// Imports
var Milestone = require(['js/Milestone.js']).Milestone;

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
  var sizes = ['small', 'big', 'gigantic'];
  var animals = ['cat', 'dog', 'mouse', 'horse'];
  var colors = ['red', 'green', 'blue'];

  for (size of sizes) {
    for (animal of animals) {
      for (color of colors) {
        var res = document.createElement("p");
        var stone = new Milestone(startDate, res, size, color, animal);
        stone.fill_in_html_element();
        resultsContainer.appendChild(res);        
        results.push(stone);
      }
    }
  }
}

function wireUpInputs() {
  document.getElementById("check_cats").onchange = updateResults;
  document.getElementById("check_dogs").onchange = updateResults;
  document.getElementById("check_red").onchange = updateResults;
  document.getElementById("check_blue").onchange = updateResults;
}

wireUpInputs();
loadDummyData();
updateResults();
