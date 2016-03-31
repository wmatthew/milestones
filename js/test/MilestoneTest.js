"use strict";
define(
  ['main/Milestone'],
  function() {
    var Milestone = require('main/Milestone');
    var FilterConstants = require('main/FilterConstants');

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
    var prefix = FilterConstants.TwoDigitPrefix_PREFIX_78;

    var mag_ONE = FilterConstants.Magnitude.ONE;
    var repeat_NONE = FilterConstants.RepeatingDigit.NONE;

    var run = function() {
      test('Create a Milestone with baseMilestone', function() {
      	var stone = Milestone.baseMilestone(start_date, time_unit, magnitude, direction_value, base_unit);

        equal(stone.start_date, start_date, 'start_date should be set properly');
        equal(stone.time_unit, time_unit, 'time_unit should be set properly');
        equal(stone.magnitude, magnitude, 'magnitude should be set properly');
        equal(stone.direction_value, direction_value, 'direction_value should be set properly');
        equal(stone.base_unit, base_unit, 'base_unit should be set properly');

        // automatically set fields
        equal(stone.repeat, repeat_NONE, 'base_unit should not have a repeating digit');
      });

      test('Create a invalid Milestones with constructors', function() {
      	var baseStone = Milestone.baseMilestone(start_date, time_unit, mag_ONE, direction_value, base_unit);
        equal(baseStone, false, 'invalid baseMilestone should be false');

        var repeatStone = Milestone.repeatDigitMilestone(start_date, time_unit, magnitude, direction_value, repeat_NONE);
        equal(repeatStone, false, 'invalid repeatMilestone should be false');

        var prefixStone = Milestone.prefixMilestone(start_date, time_unit, mag_ONE, direction_value, prefix);
        equal(prefixStone, false, 'invalid prefixStone should be false');
      });
    };
    return {run: run}
  }
);
