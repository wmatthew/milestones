// class representing a milestone result

define(function() {

	function Milestone(start_date, blank_html_element, size, color, animal) {
	  this.start_date = start_date;
	  this.html_element = blank_html_element;
	  this.size = size;
	  this.color = color;
	  this.animal = animal;

	  // TODO
	  this.end_date = this.determine_end_date();
	  this.score = 0; // TODO - for ranking
	  this.is_visible = true;

	  this.fill_in_html_element();
	}

  Milestone.prototype = {
  	constructor: Milestone,

		fill_in_html_element: function() {
			var text = document.createTextNode([this.size, this.color, this.animal].join(' '));
			this.html_element.appendChild(text);
		},

		determine_end_date: function() {
			// TODO
		},

		set_visible: function(visible) {
    	this.html_element.style.display = visible ? "block" : "none";
		}
  }

  // TODO: move enums to a util class?
	Milestone.TimeUnit = {
		HOURS : 'hours', 
		DAYS : 'days',
	}

	Milestone.BaseUnit = {
		TWO : 'two', 
		TEN : 'ten',
	}

	return Milestone;
});
