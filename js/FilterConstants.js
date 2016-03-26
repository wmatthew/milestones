define(function(require) {

  function FilterConstants() {}
  FilterConstants.prototype = {}

  var MSECS_PER_DAY = 24*60*60*1000; // TODO: defined in 2 places, consolidate

  //FilterConstants.TwoDigitPrefixes

  //function generateTwoDigitPrefixes() {}


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
		TEN_THOUSAND : {
			text: 'ten thousand',
			value: 10000,
			exponent: 4,
			weight: 4
		},
		ONE_HUNDRED_THOUSAND : {
			text: 'one hundred thousand',
			value: 100000,
			exponent: 5,
			weight: 4
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
	FilterConstants.TimeUnit = {
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
		TWO   : {text: 'base 2 (binary)', value: 2, weight: 3},
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

  // TODO: use this?
	FilterConstants.Special = {
		PI: {text: 'Pi (not pie)', value: Math.PI, weight: 10},
		SIX_SIX_SIX: {text: '666', value: 666, weight: 10}
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

  return FilterConstants;
});