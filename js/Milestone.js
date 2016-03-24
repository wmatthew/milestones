// class representing a milestone result

function Milestone(start_date, time_unit, time_number, blank_html_element) {
  this.start_date = start_date;
  this.end_date = this.determine_end_date();
  this.score = 0; // TODO - for ranking
  this.html_element = blank_html_element;
  this.is_visible = true;

  this.fill_in_html_element();
}

Milestone.prototype.fill_in_html_element = function() {
	// TODO

}

Milestone.prototype.determine_end_date = function() {
	// TODO
}

// Enums. Move to a util class?

Milestone.prototype.TimeUnit = {
	HOURS : 'hours', 
	DAYS : 'days',
}

Milestone.prototype.BaseUnit = {
	TWO : 'two', 
	TEN : 'ten',
}

