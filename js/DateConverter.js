"use strict";
define(function(require) {

  function DateConverter() {}

  DateConverter.prototype = {}

  // takes a query string (no leading question mark); returns array of dates
  DateConverter.unpackStartDates = function(query_str) {
    var resultDates = [];

    for (var chunk of query_str.split("&")) {
      var pair = chunk.split("=");
      if (pair.length !== 2) {
        continue;
      }

      var label = pair[0].split("_").join(" ");
      var dateParts = pair[1].split("-"); // YYYY-MM-DD format only
      var date = new Date(dateParts[0], dateParts[1]-1, dateParts[2]);

      if (isNaN(date)) {
        console.log("dropping invalid date: " + chunk);
        continue;
      }

      resultDates.push(DateConverter.toHash(date, label));
    }

    return resultDates;
  }

  DateConverter.toHash = function(date, label) {
    label = label.replace('&','').replace('?','').replace('=','');
    var dateText = label + " (" + dateFormat(date, "mmm dS, yyyy") + ")";
    return {
      value: date,
      text: dateText,
      shortLabel: label
    };
  }

  DateConverter.packStartDates = function(date_arr) {
    var packed = date_arr.map(function(d) {
      return d.shortLabel + "=" + dateFormat(d.value, "yyyy-mm-dd");
    }).join("&");
    return packed;
  }

  DateConverter.overwriteLocalStorageDates = function(dateList) {
    if (localStorage) {
      localStorage.setItem('events', DateConverter.packStartDates(dateList));
    }
  }

  DateConverter.getStartDates = function() {
    var dateList = [];

    function addDate(newDate) {
      // Generous dupe policy: allow different labels on same date, different dates w same label.
      if (dateList.some(function(x) {return newDate.text == x.text;})) {
        console.log("repeat date: " + newDate.text);
      } else {
        dateList.push(newDate);
      }
    }

    // dates from URL
    var search = window.location.search.substr(1);
    DateConverter.unpackStartDates(search).map(addDate);

    // dates from localStorage
    if (localStorage) {
      var events = localStorage.getItem('events');
      if (events) {
        DateConverter.unpackStartDates(events).map(addDate);
      }
    }

    // Result page doesn't look good empty. Add an event so there's something to see.
    if (dateList.length == 0) {
      DateConverter.unpackStartDates("Christmas_2016=2016-12-25").map(addDate);
      DateConverter.unpackStartDates("Obama's Birth=1961-08-04").map(addDate);
      DateConverter.unpackStartDates("Elizabeth II's Birth=1926-04-21").map(addDate);
      DateConverter.unpackStartDates("Bastille Day=1789-07-14").map(addDate);
    }

    DateConverter.overwriteLocalStorageDates(dateList);

    return dateList;
  }

  return DateConverter;
});