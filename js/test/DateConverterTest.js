"use strict";
define(
  ['main/DateConverter', 'main/BasicUtils'],
  function() {

  	require('main/BasicUtils');
    var DateConverter = require('main/DateConverter');

    var xmasDate = new Date(2016,11/*Dec*/,25);
    var queenDate = new Date(1926,3/*Apr*/,21);

   	var xmasLabel = 'Christmas 2016';
   	var queenLabel = 'Elizabeth II\'s Birth';

    var xmasHash = {
      value: xmasDate,
      text: 'Christmas 2016 (Dec 25th, 2016)',
      shortLabel: xmasLabel
    };

    var queenHash = {
      value: queenDate,
      text: 'Elizabeth II\'s Birth (Apr 21st, 1926)',
      shortLabel: queenLabel
    };

    var xmasString = "events=Christmas_2016=2016-12-25";
    var queenString = "events=Elizabeth_II's_Birth=1926-04-21";
    var bothString = "events=Christmas_2016=2016-12-25;Elizabeth_II's_Birth=1926-04-21";

    var run = function() {

    	// arr[hash] -> query str
      test('DateConverter.packStartDates', function() {
        equal(DateConverter.packStartDates([xmasHash]), xmasString, 'Xmas');
        equal(DateConverter.packStartDates([queenHash]), queenString, 'Queen');
        equal(DateConverter.packStartDates([xmasHash, queenHash]), bothString, 'Both');
      });

    	// query str -> arr[hash]
      test('DateConverter.unpackStartDates', function() {
        deepEqual(DateConverter.unpackStartDates(xmasString), [xmasHash], 'Xmas');
        deepEqual(DateConverter.unpackStartDates(queenString), [queenHash], 'Queen');

        deepEqual(DateConverter.unpackStartDates(bothString), [xmasHash, queenHash], 'Both');

        var bothStringRev = "events=Elizabeth_II's_Birth=1926-04-21;Christmas_2016=2016-12-25";
        deepEqual(DateConverter.unpackStartDates(bothStringRev), [queenHash, xmasHash], 'Both, in reverse');

        deepEqual(DateConverter.unpackStartDates("events=bad_date"), [], 'handle NaN dates');
        deepEqual(DateConverter.unpackStartDates(xmasString+"&foo=bar"), [xmasHash], 'ignore other get params besides events');
      });

      // (date, label) -> one hash
      test('DateConverter.toHash', function() {
        deepEqual(DateConverter.toHash(xmasDate, xmasLabel), xmasHash, 'Xmas');
        deepEqual(DateConverter.toHash(queenDate, queenLabel), queenHash, 'Queen');

        // TODO: confirm we're stripping out/replacing bad characters
        var problemLabel = "Problem_"
        var problemDate = new Date(2001, 0/*Jan*/, 1);
        var problemHash = {
        	value: new Date(2001, 0/*Jan*/, 1),
        	text: "Problem_ (Jan 1st, 2001)",
        	shortLabel: "Problem_"
        };
        deepEqual(DateConverter.toHash(problemDate, problemLabel), problemHash, 'handle bad characters');

        // TODO: handle NaN dates
        equal(DateConverter.toHash(NaN, xmasLabel), false, 'handle NaN dates');
      });

      test('DateConverter round trips', function() {
      	var stringToString = DateConverter.packStartDates(DateConverter.unpackStartDates(xmasString));
        equal(stringToString, xmasString, 'Convert string to hash and back');

      	var hashToHash = DateConverter.unpackStartDates(DateConverter.packStartDates([xmasHash]));
        deepEqual(hashToHash, [xmasHash], 'Convert hash to string and back');
      });

    };
    return {run: run}
  }
);
