"use strict";
define(function(require) {

  // TODO: convert to singleton?
  // we do === equality testing all over the place; any class that creates multiple FilterConstants
  // would give incorrect results.
  function FilterConstants() {}
  FilterConstants.prototype = {}

  var MSECS_PER_DAY = 24*60*60*1000; // TODO: defined in 2 places, consolidate

  FilterConstants.OneDigitPrefix = function() {
  	var hash = {
  		NO_PREFIX: {
  			text: 'no prefix',
  			value: 0,
  			weight: 0
  		}
  	};
  	for (var i=2; i<=9; i++) {
			var key = "PREFIX_" + i;
			hash[key] = {
				text: i,
				value: i,
				weight: 0
			};
  	}
  	return hash;
  }();
  FilterConstants.TwoDigitPrefix = function() {
  	var hash = {
  		NO_PREFIX: {
  			text: 'no prefix',
  			value: 0,
  			weight: 0
  		}
  	};
  	for (var i=1; i<=9; i++) {
  		for (var j=1; j<=9; j++) {
  			if (i !== j) {
  				var num = i + "" + j;
  				var key = "PREFIX_" + num;
  				hash[key] = {
  					text: num,
  					value: num,
  					weight: 0
  				};
  			}
  		}
  	}
  	return hash;
  }();

  FilterConstants.Kind = {
  	REPEAT: { text: 'repeating', example: '7777'},
  	PREFIX_TWO: { text: 'round number', example: '7800'},
  	PREFIX_ONE: { text: 'very round number', example: '7000'},
  	POWER_OF_TEN: { text: 'power of ten', example: '1000'},
  }

	FilterConstants.Direction = {
		BEFORE: {text: 'before', value: -1, weight: 0},
		AFTER:  {text: 'after',  value: 1,  weight: 0}
	}

  FilterConstants.RepeatingDigit = {
  	ONE:   {text: '1', value: 1, weight: 0 },
  	TWO:   {text: '2', value: 2, weight: 0 },
  	THREE: {text: '3', value: 3, weight: 0 },
  	FOUR:  {text: '4', value: 4, weight: 0 },
  	FIVE:  {text: '5', value: 5, weight: 0 },
  	SIX:   {text: '6', value: 6, weight: 0 },
  	SEVEN: {text: '7', value: 7, weight: 0 },
  	EIGHT: {text: '8', value: 8, weight: 0 },
  	NINE:  {text: '9', value: 9, weight: 0 },
  	NONE:  {text: 'none', value: 0, weight: 0 } // used for numbers with different digits, like 100
  }

	FilterConstants.Magnitude = {
		ONE                  : { value: 1,             exponent: 0,  weight: 10, text: 'one' },
		TEN                  : { value: 10, 			     exponent: 1,  weight: 5,  text: 'ten'	},
		HUNDRED              : { value: 100,		       exponent: 2,  weight: 5,  text: 'one hundred'	},
		THOUSAND             : { value: 1000,          exponent: 3,  weight: 8,  text: 'one thousand', shortLabel: 'thousands' },
		TEN_THOUSAND         : { value: 10000,         exponent: 4,  weight: 4,  text: 'ten thousand'	},
		ONE_HUNDRED_THOUSAND : { value: 100000,        exponent: 5,  weight: 4,  text: 'one hundred thousand' },
		MILLION              : { value: 1000000,	     exponent: 6,  weight: 10, text: 'one million', shortLabel: 'millions' },
		TEN_MILLION          : { value: 10000000,	     exponent: 7,  weight: 5,  text: 'ten million' },
		HUNDRED_MILLION      : { value: 100000000,     exponent: 8,  weight: 5,  text: 'one hundred million' },
		BILLION              : { value: 1000000000,		 exponent: 9,	 weight: 10, text: 'one billion', shortLabel: 'billions' },
		TEN_BILLION          : { value: 10000000000,   exponent: 10, weight: 4,  text: 'ten billion' },
		HUNDRED_BILLION      : { value: 100000000000,  exponent: 11, weight: 4,  text: 'one hundred billion' },
		TRILLION             : { value: 1000000000000, exponent: 12, weight: 10, text: 'one trillion', shortLabel: 'trillions' }
		// trillion is probably the max needed. 1 trillion msecs = ~31 years, so almost everything is
		// outside the valid date range (date===NaN) at this point.
	}

  // values are milliseconds
	FilterConstants.TimeUnit = {
		MICROSECONDS : {
			text: 'microsecond',
			value: 0.001 ,
			weight: 2
		},
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

	FilterConstants.Base = {
		TWO   : {text: 'binary',  value: 2, weight: 3},
		THREE : {text: 'base 3',  value: 3,  weight: 0},
		FOUR  : {text: 'base 4',  value: 4,  weight: 0},
		FIVE  : {text: 'base 5',  value: 5,  weight: 0},
		SIX   : {text: 'base 6',  value: 6,  weight: 0},
		SEVEN : {text: 'base 7',  value: 7,  weight: 0},
		EIGHT : {text: 'base 8',  value: 8,  weight: 0},
	  NINE  : {text: 'base 9',  value: 9,  weight: 0},
		TEN   : {text: 'base 10', value: 10, weight: 10}
	}

	FilterConstants.Era = {
		PAST   : {text: 'past',   value: -1, weight: 2},
		TODAY  : {text: 'today',  value:  0, weight: 10},
		FUTURE : {text: 'future', value:  1, weight: 8}
	}

  function values(hash) {
    return Object.keys(hash).map(function (v) {return hash[v];});
  }

	FilterConstants.DirectionValues      = values(FilterConstants.Direction);
	FilterConstants.MagnitudeValues      = values(FilterConstants.Magnitude);
	FilterConstants.TimeUnitValues       = values(FilterConstants.TimeUnit);
	FilterConstants.BaseValues           = values(FilterConstants.Base);
	FilterConstants.EraValues            = values(FilterConstants.Era);
	FilterConstants.RepeatingDigitValues = values(FilterConstants.RepeatingDigit);
	FilterConstants.OneDigitPrefixValues = values(FilterConstants.OneDigitPrefix);
	FilterConstants.TwoDigitPrefixValues = values(FilterConstants.TwoDigitPrefix);
	FilterConstants.KindValues           = values(FilterConstants.Kind);

  return FilterConstants;
});