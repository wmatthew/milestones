// class representing a milestone result

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

Milestone.prototype.fill_in_html_element = function() {
	var text = document.createTextNode([this.size, this.color, this.animal].join(' '));
	res.appendChild(text);
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

