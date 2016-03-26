// class representing a milestone result
define(function(require) {

  var FilterConstants = require('FilterConstants');
  var MSECS_PER_DAY = 24*60*60*1000; // TODO: defined in 2 places, consolidate

	function Milestone(start_date, time_unit, magnitude, direction_value, base_unit, repeat, prefix) {
	  this.start_date = start_date;
	  this.time_unit = time_unit; // seconds, minutes, etc.
	  this.magnitude = magnitude; // 1, 10, 100, etc.
	  this.direction_value = direction_value;
	  this.base_unit = base_unit;
	  this.repeat = repeat;
	  this.prefix = prefix;

	  this.determine_end_date();
	  this.determine_weight();
	}

  Milestone.baseMilestone = function(start_date, time_unit, magnitude, direction_value, base_unit) {
  	if (magnitude == FilterConstants.Magnitude.ONE && base_unit !== FilterConstants.Base.TEN) {
  		return false; // one is the same in all bases
  	} else {
  	  var stone = new Milestone(
  	  	start_date,
  	  	time_unit,
  	  	magnitude,
  	  	direction_value,
  	  	base_unit,
  	  	FilterConstants.RepeatingDigit.NONE,
  	  	FilterConstants.TwoDigitPrefix.NO_PREFIX);
  	  return stone;
    }
  }

  Milestone.repeatDigitMilestone = function(start_date, time_unit, magnitude, direction_value, repeat) {
  	if (repeat == FilterConstants.RepeatingDigit.NONE) {
  		return false; // there's no digit to repeat.
  	} else if (magnitude == FilterConstants.Magnitude.ONE) {
  		return false; // too short for repeating digits.
  	} else {
    	var stone = new Milestone(
    		start_date,
    		time_unit,
    		magnitude,
    		direction_value,
    		FilterConstants.Base.TEN,
    		repeat,
    		FilterConstants.TwoDigitPrefix.NO_PREFIX);
    	return stone;
  	}
  }

  Milestone.prefixMilestone = function(start_date, time_unit, magnitude, direction, prefix) {
  	if (magnitude == FilterConstants.Magnitude.ONE) {
  		return false; // too short for two-digit prefix.
  	} else {
	    var stone = new Milestone(
	    	start_date,
	    	time_unit,
	    	magnitude,
	    	direction,
	    	FilterConstants.Base.TEN,
	    	FilterConstants.RepeatingDigit.NONE,
	    	prefix);
	    return stone;
	  }
  }

  Milestone.prototype = {
  	constructor: Milestone,

		attachElement: function(element) {
			if (!this.valid) {
				return;
			}

			this.html_element = element;

			var header = document.createElement("h3");
			var headerText = document.createTextNode(dateFormat(this.end_date, "mmmm dS, yyyy"));
      this.html_element.appendChild(header);
      header.appendChild(headerText);

      var pluralizedUnits = this.time_unit.text + ((this.magnitude.value == 1) ? '' : 's');
      var endTime = dateFormat(this.end_date, "h:MMtt");

      var displayDirection = this.direction_value == FilterConstants.Direction.AFTER ? 'since' : 'until';

			var text = document.createTextNode(
				[
				  endTime + ":",
				  this.displayValue(),
				  pluralizedUnits,
				  displayDirection,
				  this.start_date.shortLabel
				].join(' ')
		  );
			this.html_element.appendChild(text);

      // Add an explanation for non-base-ten numbers
      if (this.base_unit !== FilterConstants.Base.TEN) {
      	this.html_element.appendChild(document.createElement("br"));
	      var baseText = document.createTextNode("(" + this.magnitude.text + " " + pluralizedUnits + " in " + this.base_unit.text + ")")
				this.html_element.appendChild(baseText);
      }
		},

    displayValue: function() {
    	if (this.base_unit === FilterConstants.Base.TEN &&
    		  this.repeat === FilterConstants.RepeatingDigit.NONE &&
    		  this.prefix === FilterConstants.TwoDigitPrefix.NO_PREFIX) {
				return this.magnitude.text; // eg, "one million"
    	} else {
    		return Math.abs(this.rawValue); // eg, "77777"
    	}
    },

    determine_weight: function() {
    	// give bonus for future results that are coming up soon
    	var soonBonus = (this.end_date - Date.now()) / MSECS_PER_DAY;
    	if (soonBonus < 0) {
    		this.era = FilterConstants.Era.PAST;
    		soonBonus = 0;
    	} else if (soonBonus == 0) {
    		this.era = FilterConstants.Era.TODAY;
    		soonBonus = 100;
    	} else {
    		this.era = FilterConstants.Era.FUTURE;
    		soonBonus = 100 / Math.log(soonBonus);
    	}

    	this.weight = this.magnitude.weight + this.time_unit.weight + this.base_unit.weight;
    	this.weight += soonBonus;
    },

		determine_end_date: function() {
      // Set rawValue
      this.rawValue = this.direction_value.value;
      if (this.prefix !== FilterConstants.TwoDigitPrefix.NO_PREFIX) {
      	// eg, 12000
      	this.rawValue *= parseInt(this.prefix.value + Array(this.magnitude.exponent).join('0'));
      } else if (this.repeat !== FilterConstants.RepeatingDigit.NONE) {
  			// eg, 7777777
  			this.rawValue *= parseInt(Array(this.magnitude.exponent+2).join(this.repeat.value));
  		} else {
  			// eg, 1000
    		this.rawValue *= Math.pow(this.base_unit.value, this.magnitude.exponent);
  		}

			if (this.time_unit == FilterConstants.TimeUnit.MONTHS) {
				// special case: need to calculate this.end_date by months, not by days.
				this.end_date = new Date(this.start_date.value);
				this.end_date.setMonth(this.end_date.getMonth() + this.rawValue);
			} else if (this.time_unit == FilterConstants.TimeUnit.YEARS) {
				// special case: need to calculate this.end_date by year, not by days.
				this.end_date = new Date(this.start_date.value);
				this.end_date.setYear(this.end_date.getFullYear() + this.rawValue);
			} else {
				var days_forward = this.rawValue * this.time_unit.value / MSECS_PER_DAY;
				this.end_date = new Date(this.start_date.value);
				this.end_date.setDate(this.start_date.value.getDate() + days_forward);
			}

			if (isNaN(this.end_date)) {
				// console.log("NaN!");
				this.valid = false;
			} else {
				this.valid = true;
			}
		},

		set_visible: function(visible) {
    	this.html_element.style.display = visible ? "block" : "none";
		}
  }

	return Milestone;
});
