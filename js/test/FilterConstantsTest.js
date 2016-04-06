"use strict";
define(
  ['main/FilterConstants'],
  function() {
    var FilterConstants = require('main/FilterConstants');

    var run = function() {
      test('FilterConstants.TwoDigitPrefix', function() {

        equal(FilterConstants.TwoDigitPrefix.PREFIX_63.value, '63', 'TwoDigitPrefix.PREFIX_63');

        equal(FilterConstants.TwoDigitPrefixValues.length, 73, 'check size of values array');

        equal(FilterConstants.TwoDigitPrefixValues[2].value, '13', 'values array - spot check third value');
      });

      test('FilterConstants.Direction', function() {
        equal(FilterConstants.DirectionValues.length, 2, 'size of values array');
      });

      test('FilterConstants value arrays must not have repeated elements', function() {

        function checkForDuplicates(array) {
          equal(new Set(array).size, array.length, 'should not have duplicates');
        }

        checkForDuplicates(FilterConstants.DirectionValues);
        checkForDuplicates(FilterConstants.MagnitudeValues);
        checkForDuplicates(FilterConstants.TimeUnitValues);
        checkForDuplicates(FilterConstants.BaseValues);
        checkForDuplicates(FilterConstants.EraValues);
        checkForDuplicates(FilterConstants.RepeatingDigitValues);
        checkForDuplicates(FilterConstants.TwoDigitPrefixValues);
      });
    };
    return {run: run}
  }
);
