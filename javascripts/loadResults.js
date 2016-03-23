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
document.getElementById("check_odds").onchange=updateResults();
document.getElementById("check_evens").onchange=updateResults();

// Initial Update
updateResults();

function updateResults() {
  var odds = document.getElementById("check_odds").checked;
  var evens = document.getElementById("check_evens").checked;

	console.log("Updating Results");
	for (result of results) {
    result.style.display = "block";
    if (!odds && res.value % 2 == 1) {
      result.style.display = "none";
    }
    if (!evens && res.value % 2 == 0) {
      result.style.display = "none";
    }
	}
  
}