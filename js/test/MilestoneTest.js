"use strict";
define(
  ['main/Milestone', 'lib/date.format'],
  function() {
    var Milestone = require('main/Milestone');
    var FilterConstants = Milestone.getFilterConstants();

    function dateHelper(date) {
    	return {
	      value: date,
	      text: "Long Description",
	      shortLabel: "Short Label"
	    };
    }

    // Define some constants we can use across tests
    var xmasDate = new Date(2015, 11/*Dec*/, 25);
    var start_date = {
      value: xmasDate,
      text: "XMas 2015 (Dec 25 2015)",
      shortLabel: "XMas 2015"
    }
    var time_unit = FilterConstants.TimeUnit.MINUTES;
    var magnitude = FilterConstants.Magnitude.THOUSAND;
    var direction_value = FilterConstants.Direction.BEFORE;
    var base_unit = FilterConstants.Base.SEVEN;
    var prefix = FilterConstants.TwoDigitPrefix.PREFIX_78;
    var repeat = FilterConstants.RepeatingDigit.THREE;

    var mag_ONE = FilterConstants.Magnitude.ONE;
    var repeat_NONE = FilterConstants.RepeatingDigit.NONE;

    var run = function() {
      test('Milestone.baseMilestone (constructor)', function() {
      	var stone = Milestone.baseMilestone(start_date, time_unit, magnitude, direction_value, base_unit);

        equal(stone.start_date, start_date, 'start_date should be set properly');
        equal(stone.time_unit, time_unit, 'time_unit should be set properly');
        equal(stone.magnitude, magnitude, 'magnitude should be set properly');
        equal(stone.direction_value, direction_value, 'direction_value should be set properly');
        equal(stone.base_unit, base_unit, 'base_unit should be set properly');

        // automatically set fields
        equal(stone.repeat, repeat_NONE, 'should not have a repeating digit');
        equal(stone.kind, FilterConstants.Kind.POWER_OF_TEN, 'should have kind set');
      });

      test('Milestone.repeatDigitMilestone (constructor)', function() {
      	var stone = Milestone.repeatDigitMilestone(start_date, time_unit, magnitude, direction_value, repeat);

        equal(stone.start_date, start_date, 'start_date should be set properly');
        equal(stone.time_unit, time_unit, 'time_unit should be set properly');
        equal(stone.magnitude, magnitude, 'magnitude should be set properly');
        equal(stone.direction_value, direction_value, 'direction_value should be set properly');
        equal(stone.repeat, repeat, 'base_unit should not have a repeating digit');

        // automatically set fields
        equal(stone.base_unit, FilterConstants.Base.TEN, 'base_unit should be set to base 10 automatically');
        equal(stone.kind, FilterConstants.Kind.REPEAT, 'should have kind set');
      });

      test('Milestone.prefixOneMilestone (constructor)', function() {
      	var stone = Milestone.prefixOneMilestone(start_date, time_unit, magnitude, direction_value, prefix);

        equal(stone.start_date, start_date, 'start_date should be set properly');
        equal(stone.time_unit, time_unit, 'time_unit should be set properly');
        equal(stone.magnitude, magnitude, 'magnitude should be set properly');
        equal(stone.direction_value, direction_value, 'direction_value should be set properly');
        equal(stone.prefix, prefix, 'prefix should be set properly');

        // automatically set fields
        equal(stone.base_unit, FilterConstants.Base.TEN, 'base_unit should be set to base 10 automatically');
        equal(stone.repeat, repeat_NONE, 'should not have a repeating digit');
        equal(stone.kind, FilterConstants.Kind.PREFIX_ONE, 'should have kind set');
      });

      test('Milestone.prefixTwoMilestone (constructor)', function() {
      	var stone = Milestone.prefixTwoMilestone(start_date, time_unit, magnitude, direction_value, prefix);

        equal(stone.start_date, start_date, 'start_date should be set properly');
        equal(stone.time_unit, time_unit, 'time_unit should be set properly');
        equal(stone.magnitude, magnitude, 'magnitude should be set properly');
        equal(stone.direction_value, direction_value, 'direction_value should be set properly');
        equal(stone.prefix, prefix, 'prefix should be set properly');

        // automatically set fields
        equal(stone.base_unit, FilterConstants.Base.TEN, 'base_unit should be set to base 10 automatically');
        equal(stone.repeat, repeat_NONE, 'should not have a repeating digit');
        equal(stone.kind, FilterConstants.Kind.PREFIX_TWO, 'should have kind set');
      });

      test('Milestone: Create invalid Milestones with constructors', function() {
      	var baseStone = Milestone.baseMilestone(start_date, time_unit, mag_ONE, direction_value, base_unit);
        equal(baseStone, false, 'invalid baseMilestone should be false');

        var repeatStone = Milestone.repeatDigitMilestone(start_date, time_unit, magnitude, direction_value, repeat_NONE);
        equal(repeatStone, false, 'invalid repeatMilestone (repeat NONE) should be false');

        var repeatStone = Milestone.repeatDigitMilestone(start_date, time_unit, mag_ONE, direction_value, repeat);
        equal(repeatStone, false, 'invalid repeatMilestone (magnitude 1) should be false');

        var prefixStone = Milestone.prefixOneMilestone(start_date, time_unit, mag_ONE, direction_value, prefix);
        equal(prefixStone, false, 'invalid prefixStone should be false');
      });

      test('Milestone.displayText', function() {
        var xmasStone = Milestone.baseMilestone(start_date, time_unit, magnitude, direction_value, base_unit);
        equal(xmasStone.displayText(), '6:17pm: 343 minutes until XMas 2015', 'Works for basic milestone');

        var threeFourStone = Milestone.prefixTwoMilestone(start_date, FilterConstants.TimeUnit.YEARS, FilterConstants.Magnitude.TEN, direction_value, FilterConstants.TwoDigitPrefix.PREFIX_34);
        equal(threeFourStone.displayText(), '34 years until XMas 2015', 'non time-specific milestone');
      });

      test('Milestone.displayYear', function() {
        var xmasStone = Milestone.baseMilestone(start_date, time_unit, magnitude, direction_value, base_unit);
        equal(xmasStone.displayYear(), '2015', 'Works for basic year');

        var ancientDate = new Date(-100, 6, 6);
        var ancientPastStone =  Milestone.baseMilestone(dateHelper(ancientDate), time_unit, magnitude, direction_value, base_unit);
        equal(ancientPastStone.displayYear(), '101 BC', 'Works for ancient dates')

        var oldDate = new Date(150, 6, 6);
        var oldStone =  Milestone.baseMilestone(dateHelper(oldDate), time_unit, magnitude, direction_value, base_unit);
        equal(oldStone.displayYear(), '150 AD', 'Works for old dates')

        var futureDate = new Date(12345, 6, 6);
        var distantFutureStone =  Milestone.baseMilestone(dateHelper(futureDate), time_unit, magnitude, direction_value, base_unit);
        equal(distantFutureStone.displayYear(), '12345', 'Works for ancient dates')
      });

      test('Milestone.displayTime', function() {
      	var xmasStone = Milestone.baseMilestone(start_date, time_unit, magnitude, direction_value, base_unit);
        equal(xmasStone.displayTime(), '6:17pm: ', 'displays normally');
      });
    };
    return {run: run}
  }
);
