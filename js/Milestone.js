// class representing a milestone result

define(function() {

	function Milestone(start_date, blank_html_element, time_unit, base_unit, time_value) {
	  this.start_date = start_date;
	  this.html_element = blank_html_element;
	  this.base_unit = base_unit;
	  this.time_unit = time_unit;
	  this.time_value = time_value;

	  // TODO
	  this.end_date = this.determine_end_date();
	  this.score = 0; // TODO - for ranking
	  this.is_visible = true;

	  this.fill_in_html_element();
	}

  Milestone.prototype = {
  	constructor: Milestone,

		fill_in_html_element: function() {
			var header = document.createElement("h3");
			header.innerHTML = this.end_date;
      this.html_element.appendChild(header);

			var text = document.createTextNode(["One", this.time_value, this.time_unit, "after (base", this.base_unit, ")"].join(' '));
			this.html_element.appendChild(text);
		},

		determine_end_date: function() {
			// TODO
			return this.start_date;
		},

		set_visible: function(visible) {
    	this.html_element.style.display = visible ? "block" : "none";
		}
  }

	Milestone.TimeValue = {
		HUNDRED : 'hundred', 
		THOUSAND : 'thousand', 
		MILLION : 'million'
	}

	Milestone.TimeUnit = {
		SECONDS : 'seconds', 
		HOURS : 'hours', 
		DAYS : 'days'
	}

	Milestone.BaseUnit = {
		TWO : 'two', 
		TEN : 'ten'
	}

	Milestone.TimeValueValues = Object.keys(Milestone.TimeValue).map(function (v) {return Milestone.TimeValue[v];});
	Milestone.TimeUnitValues = Object.keys(Milestone.TimeUnit).map(function (v) {return Milestone.TimeUnit[v];});
	Milestone.BaseUnitValues = Object.keys(Milestone.BaseUnit).map(function (v) {return Milestone.BaseUnit[v];});

	return Milestone;
});
