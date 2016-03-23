// Load some dummy results.
var resultsContainer = document.getElementById("results_container");
var results = [];

for (var i=1; i<=10; i++) {
	console.log("Loop +" +i);
	var res = document.createElement("p");
	var text = document.createTextNode("Result #" + i);
	res.appendChild(text);
	res.value = i;

	results.push(res);

	resultsContainer.appendChild(res);
}

// Wire up the inputs
document.getElementById("check_odds").onchange = updateResults;
document.getElementById("check_evens").onchange = updateResults;

// Initial Update
updateResults();

function updateResults() {
  var hide_odds = !document.getElementById("check_odds").checked;
  var hide_evens = !document.getElementById("check_evens").checked;

	console.log("Updating Results");
	for (result of results) {
    result.style.display = "block";

    var current_is_odd = res.value % 2 == 1;
    if (hide_odds && current_is_odd) {
      result.style.display = "none";
    }

    var current_is_even = res.value % 2 == 0;
    if (hide_evens && current_is_even) {
      result.style.display = "none";
    }
	}
  
}