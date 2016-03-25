// class representing a milestone result

define(function() {

  var MSECS_PER_DAY = 24*60*60*1000;
  //var dateFormat2 = require(['lib/date.format']);

	function Milestone(start_date, blank_html_element, time_unit, base_unit, time_value) {
	  this.start_date = start_date;
	  this.html_element = blank_html_element;
	  this.base_unit = base_unit;
	  this.time_unit = time_unit;
	  this.time_value = time_value;

	  this.determine_end_date();
	  this.determine_weight();
	  this.fill_in_html_element();
	}

  Milestone.prototype = {
  	constructor: Milestone,

		fill_in_html_element: function() {
			if (!this.valid) {
				return;
			}
			var header = document.createElement("h3");
			var headerText = document.createTextNode(dateFormat(this.end_date, "mmmm dS, yyyy"));
      this.html_element.appendChild(header);
      header.appendChild(headerText);

      var pluralizedUnits = this.time_unit.text + ((this.time_value.value == 1) ? '' : 's');
      var endTime = dateFormat(this.end_date, "h:MMtt");

      var displayValue = (this.base_unit == Milestone.BaseUnit.TEN) ? this.time_value.text : this.rawValue;

			var text = document.createTextNode([endTime+":", displayValue, pluralizedUnits, "after ", dateFormat(this.start_date.value, "mmm dS, yyyy")].join(' '));
			this.html_element.appendChild(text);

      if (this.base_unit !== Milestone.BaseUnit.TEN) {
      	this.html_element.appendChild(document.createElement("br"));
	      var baseText = document.createTextNode("(" + this.time_value.text + " " + pluralizedUnits + " in " + this.base_unit.text + ")")
				this.html_element.appendChild(baseText);
      }

			//var bonusText = document.createTextNode("+" + this.weight);
			//this.html_element.appendChild(bonusText);

			//var soonBonusText = document.createTextNode("+" + this.soonBonus.toPrecision(2));
			//this.html_element.appendChild(soonBonusText);
		},

    determine_weight: function() {
    	// give bonus for future results that are coming up soon
    	var soonBonus = (this.end_date - Date.now()) / MSECS_PER_DAY;
    	if (soonBonus < 0) {
    		this.era = Milestone.Era.PAST;
    		soonBonus = 0;
    	} else if (soonBonus == 0) {
    		this.era = Milestone.Era.TODAY;
    		soonBonus = 100;
    	} else {
    		this.era = Milestone.Era.FUTURE;
    		soonBonus = 100 / Math.log(soonBonus);
    	}

      this.soonBonus = soonBonus;
    	this.weight = this.time_value.weight + this.time_unit.weight + this.base_unit.weight + soonBonus;
    },

		determine_end_date: function() {
  		this.rawValue = Math.pow(this.base_unit.value, this.time_value.exponent);

			if (this.time_unit == Milestone.TimeUnit.MONTHS) {
				// special case: need to calculate this.end_date a different way.
				this.end_date = new Date(this.start_date.value);
				this.end_date.setMonth(this.end_date.getMonth() + this.rawValue);
			} else if (this.time_unit == Milestone.TimeUnit.YEARS) {
				// special case: need to calculate this.end_date a different way.
				this.end_date = new Date(this.start_date.value);
				this.end_date.setYear(this.end_date.getFullYear() + this.rawValue);
			} else {
				var days_forward = this.rawValue * this.time_unit.value / MSECS_PER_DAY;
				this.end_date = new Date(this.start_date.value);
				this.end_date.setDate(this.start_date.value.getDate() + days_forward);
			}

			if (isNaN(this.end_date)) {
				console.log("NaN!");
				this.valid = false;
			} else {
				this.valid = true;
			}
		},

		set_visible: function(visible) {
    	this.html_element.style.display = visible ? "block" : "none";
		}
  }

	Milestone.TimeValue = {
		ONE : {
			text: 'one',
			value: 1,
			exponent: 0,
			weight: 10
		},
		TEN : {
			text: 'ten',
			value: 10,
			exponent: 1,
			weight: 5
		},
		HUNDRED : {
		  text: 'one hundred',
		  value: 100,
		  exponent: 2,
		  weight: 5
		},
		THOUSAND : {
			text: 'one thousand',
			value: 1000,
			exponent: 3,
			weight: 8
		},
		MILLION : {
			text: 'one million',
			value: 1000000,
			exponent: 6,
			weight: 10
		},
		BILLION : {
			text: 'one billion',
			value: 1000000000,
			exponent: 9,
			weight: 10
		},
		TRILLION : {
			text: 'one trillion',
			value: 1000000000000,
			exponent: 12,
			weight: 10
		},
	}

  // values are milliseconds
	Milestone.TimeUnit = {
		MILLISECONDS : {
			text: 'millisecond',
			value: 1 ,
			weight: 3
		},
		SECONDS : {
			text: 'second',
			value: 1000 ,
			weight: 6
		},
		MINUTES : {
			text: 'minute',
  		value: 60*1000,
	  	weight: 3
	  },
		HOURS : {
			text: 'hour',
		  value: 60*60*1000,
  		weight: 5
  	},
		DAYS : {
			text: 'day',
	  	value: MSECS_PER_DAY,
		  weight: 10
		},
		WEEKS : {
			text: 'week',
  		value: 7*MSECS_PER_DAY,
	  	weight: 1
	  },
		FORTNIGHTS : {
			text: 'fortnight',
  		value: 14*MSECS_PER_DAY,
	  	weight: 0
	  },
		MONTHS : {
			text: 'month',
  		value: 30*MSECS_PER_DAY,
	  	weight: 1
	  },
		YEARS : {
			text: 'year',
  		value: 365*MSECS_PER_DAY,
	  	weight: 1
	  }
	}

	Milestone.BaseUnit = {
		TWO   : {text: 'base 2 (binary)', value: 2, weight: 3},
		THREE : {text: 'base 3',  value: 3,  weight: 0},
		FOUR :  {text: 'base 4',  value: 4,  weight: 0},
		FIVE :  {text: 'base 5',  value: 5,  weight: 0},
		SIX  :  {text: 'base 6',  value: 6,  weight: 0},
		SEVEN:  {text: 'base 7',  value: 7,  weight: 0},
		EIGHT:  {text: 'base 8',  value: 8,  weight: 0},
	  NINE :  {text: 'base 9',  value: 9,  weight: 0},
		TEN  :  {text: 'base 10', value: 10, weight: 10}
	}

	Milestone.Era = {
		PAST : {text: 'past', value: -1, weight: 2},
		TODAY : {text: 'today', value: 0, weight: 10},
		FUTURE : {text: 'future', value: 1, weight: 8}
	}

  // TODO: use this?
	Milestone.Special = {
		PI: {text: 'Pi', value: Math.PI, weight: 10},
		666: {text: '666', value: 666, weight: 10}
	}

  function getValues(hash) {
    return Object.keys(hash).map(function (v) {return hash[v];});
  }

	Milestone.TimeValueValues = getValues(Milestone.TimeValue);
	Milestone.TimeUnitValues = getValues(Milestone.TimeUnit);
	Milestone.BaseUnitValues = getValues(Milestone.BaseUnit);
	Milestone.EraValues = getValues(Milestone.Era);

	return Milestone;
});
