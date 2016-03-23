// Load some dummy results.
var resultsContainer = document.getElementById("results_container");

for (var i=1; i<=10; i++) {
	var res = document.createElement("p");
	var text = document.createTextNode("Result #" + i);
	res.appendChild(text);

	resultsContainer.appendChild(res);
}