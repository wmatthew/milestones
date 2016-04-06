"use strict";
// class representing a milestone result
define(function(require) {

  var FilterConstants = require('main/FilterConstants');
  var MSECS_PER_DAY = 24*60*60*1000; // TODO: defined in 2 places, consolidate

  // Constructor.
  // Don't call directly; use methods like baseMilestone, repeatingDigitMilestone, etc.
	function Milestone(start_date, time_unit, magnitude, direction_value, base_unit, repeat, prefix, sequence, kind) {
	  this.start_date = start_date;
	  this.time_unit = time_unit; // seconds, minutes, etc.
	  this.magnitude = magnitude; // 1, 10, 100, etc.
	  this.direction_value = direction_value;
	  this.base_unit = base_unit;
	  this.repeat = repeat;
	  this.prefix = prefix;
    this.sequence = sequence;
    this.kind = kind;
    this.valid = true;

	  this.determine_end_date();
	  this.determine_weight();
	}

  Milestone.getFilterConstants = function() {
    return FilterConstants;
  }

  // Create a milestone in an unusual base (eg binary)
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
  	  	FilterConstants.TwoDigitPrefix.NO_PREFIX,
        FilterConstants.Sequence.NO_SEQUENCE,
        FilterConstants.Kind.POWER_OF_TEN);
  	  return stone;
    }
  }

  // Create a milestone with repeating digits, eg 77,777
  Milestone.repeatDigitMilestone = function(start_date, time_unit, magnitude, direction_value, repeat) {
  	if (repeat === FilterConstants.RepeatingDigit.NONE) {
  		return false; // there's no digit to repeat.
  	} else if (magnitude === FilterConstants.Magnitude.ONE) {
  		return false; // too short for repeating digits.
  	} else {
    	var stone = new Milestone(
    		start_date,
    		time_unit,
    		magnitude,
    		direction_value,
    		FilterConstants.Base.TEN,
    		repeat,
    		FilterConstants.TwoDigitPrefix.NO_PREFIX,
        FilterConstants.Sequence.NO_SEQUENCE,
        FilterConstants.Kind.REPEAT);
    	return stone;
  	}
  }

  // Create a big round number milestone like 70,000,000
  Milestone.prefixOneMilestone = function(start_date, time_unit, magnitude, direction_value, prefix) {
    if (magnitude === FilterConstants.Magnitude.ONE) {
      return false; // too short for two-digit prefix.
    } else if (prefix === FilterConstants.OneDigitPrefix.NO_PREFIX) {
      return false; // need a prefix.
    } else {
      var stone = new Milestone(
        start_date,
        time_unit,
        magnitude,
        direction_value,
        FilterConstants.Base.TEN,
        FilterConstants.RepeatingDigit.NONE,
        prefix,
        FilterConstants.Sequence.NO_SEQUENCE,
        FilterConstants.Kind.PREFIX_ONE);
      return stone;
    }
  }

  // Create a big round number milestone like 76,000,000
  Milestone.prefixTwoMilestone = function(start_date, time_unit, magnitude, direction_value, prefix) {
    if (magnitude.value <= FilterConstants.Magnitude.ONE.value) {
      return false; // too short for two-digit prefix. Need at least one zero.
    } else if (prefix === FilterConstants.TwoDigitPrefix.NO_PREFIX) {
      return false; // need a prefix.
    } else {
      var stone = new Milestone(
        start_date,
        time_unit,
        magnitude,
        direction_value,
        FilterConstants.Base.TEN,
        FilterConstants.RepeatingDigit.NONE,
        prefix,
        FilterConstants.Sequence.NO_SEQUENCE,
        FilterConstants.Kind.PREFIX_TWO);
      return stone;
    }
  }

  // Create a sequence number milestone like 12,345
  Milestone.sequenceMilestone = function(start_date, time_unit, magnitude, direction_value, sequence) {
    if (magnitude.exponent <= 1 || magnitude.exponent >= 9) {
      return false; // too short/long for a sequence.
    } else if (sequence === FilterConstants.Sequence.NO_SEQUENCE) {
      return false; // need a sequence.
    } else {
      var stone = new Milestone(
        start_date,
        time_unit,
        magnitude,
        direction_value,
        FilterConstants.Base.TEN,
        FilterConstants.RepeatingDigit.NONE,
        FilterConstants.TwoDigitPrefix.NO_PREFIX,
        sequence,
        FilterConstants.Kind.SEQUENCE);
      return stone;
    }
  }

  Milestone.prototype = {
  	constructor: Milestone,

    // Creates an element if needed.
    // This won't attach it to the DOM; that's up to the caller.
		getOrCreateElement: function() {
			if (!this.valid) {
				return;
			}

      if (this.html_element) {
        return this.html_element;
      }

      this.html_element = document.createElement("p");
      this.html_element.className = "entry";

			this.header = document.createElement("h3");
			var headerTextNode = document.createTextNode(this.getHeaderText());
      this.html_element.appendChild(this.header);
      this.header.appendChild(headerTextNode);

      var text = document.createTextNode(this.displayText());
			this.html_element.appendChild(text);

      // parenthetical explanation for non-base-ten numbers
      if (this.base_unit !== FilterConstants.Base.TEN) {
      	this.html_element.appendChild(document.createElement("br"));
        var baseNote = document.createElement("span");
        baseNote.className = "minor";
        baseNote.textContent = this.displayBaseNote();
				this.html_element.appendChild(baseNote);
      }
      return this.html_element;
		},

    getHeaderText: function() {
      return dateFormat(this.end_date, "mmmm dS, ") + this.displayYear();
    },

    displayText: function() {
      var pluralizedUnits = this.time_unit.text + ((this.magnitude.value == 1) ? '' : 's');
      var displayDirection = this.direction_value == FilterConstants.Direction.AFTER ? 'since' : 'until';
      var text =
        [
          this.displayTime() + this.displayValue(),
          pluralizedUnits,
          displayDirection,
          this.start_date.shortLabel
        ].join(' ');
      return text;
    },

    displayBaseNote: function() {
      var pluralizedUnits = this.time_unit.text + ((this.magnitude.value == 1) ? '' : 's');
      return "(" + this.magnitude.text + " " + pluralizedUnits + " in " + this.base_unit.text + ")";
    },

    displayYear: function() {
      var year = this.end_date.getFullYear();
      if (year <= 0) {
        // The year before 1 AD is 1 BC.
        return (Math.abs(year) + 1) + " BC";
      } else if (year < 1000) {
        return year + " AD";
      } else {
        return year;
      }

    },

    displayTime: function() {
    	if (this.time_unit.value < MSECS_PER_DAY) {
        return dateFormat(this.end_date, "h:MMtt: ");
    	} else {
    		// Time is irrelevant for this milestone.
    		return '';
      }
    },

    displayValue: function() {
    	if (this.kind === FilterConstants.Kind.POWER_OF_TEN &&
          this.base === FilterConstants.Base.TEN) {
				return this.magnitude.text; // eg, "one million"
    	} else {
    		return addCommas(Math.abs(this.rawValue)); // eg, "77777"
    	}
    },

    // Could be used for "best match" sorting
    determine_weight: function() {
      var now = new Date();
    	var timeDiff = (this.end_date - now) / MSECS_PER_DAY;
      var sameDay = (now.getDate() == this.end_date.getDate() &&
                     now.getMonth() == this.end_date.getMonth() &&
                     now.getFullYear() == this.end_date.getFullYear());

      if (sameDay) {
        this.era = FilterConstants.Era.TODAY;
      } else if (timeDiff < 0) {
    		this.era = FilterConstants.Era.PAST;
    	} else {
    		this.era = FilterConstants.Era.FUTURE;
    	}

    	this.weight = this.magnitude.weight +
                    this.time_unit.weight +
                    this.base_unit.weight;
    },

		determine_end_date: function() {
      // Set rawValue
      this.rawValue = this.direction_value.value;
      if (this.kind === FilterConstants.Kind.PREFIX_ONE) {
        // eg, 7000
        this.rawValue *= parseInt(this.prefix.value + Array(this.magnitude.exponent + 1).join('0'));
      } else if (this.kind === FilterConstants.Kind.PREFIX_TWO) {
        // eg, 6700
        this.rawValue *= parseInt(this.prefix.value + Array(this.magnitude.exponent).join('0'));
      } else if (this.kind === FilterConstants.Kind.REPEAT) {
        // eg, 7777
        this.rawValue *= parseInt(Array(this.magnitude.exponent+2).join(this.repeat.value));
  		} else if (this.kind === FilterConstants.Kind.SEQUENCE) {
        // eg, 1234
        var str = "";
        for (var i=1; i<=this.magnitude.exponent+1; i++) {
          str = (this.sequence.value > 0) ? str+(i%10) : (i%10)+str;
        }
        this.rawValue *= parseInt(str);
      } else {
  			// eg, 1000
    		this.rawValue *= Math.pow(this.base_unit.value, this.magnitude.exponent);
  		}

			if (this.time_unit === FilterConstants.TimeUnit.MONTHS) {
				// special case: need to calculate this.end_date by months, not by days.
				this.end_date = new Date(this.start_date.value);
				this.end_date.setMonth(this.end_date.getMonth() + this.rawValue);
			} else if (this.time_unit === FilterConstants.TimeUnit.YEARS) {
				// special case: need to calculate this.end_date by year, not by days.
				this.end_date = new Date(this.start_date.value);
				this.end_date.setYear(this.end_date.getFullYear() + this.rawValue);
			} else {
				this.end_date = new Date(this.start_date.value);
        var msecs_forward = this.rawValue * this.time_unit.value;
				this.end_date.setTime(this.start_date.value.getTime() + msecs_forward);
			}

      if (this.start_date.value.getTime() == this.end_date.getTime()) {
        this.valid = false;
      }

      this.end_date = new Date(this.end_date); // necessary to catch invalid dates in Safari
			if (isNaN(this.end_date)) {
        this.valid = false;
      }
		},

    set_visible: function(visible) {
      if (this.html_element) {
        this.html_element.style.display = visible ? "block" : "none";
      }
    },

    is_visible: function() {
      return this.html_element && this.html_element.style.display === "block";
    }
  }

  function addCommas(num) {
    num = num+"";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

	return Milestone;
});
