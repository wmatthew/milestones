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

      var dateText = label + " (" + dateFormat(date, "mmm dS, yyyy") + ")";
      resultDates.push({
        value: date,
        text: dateText,
        shortLabel: label
      });
    }

    return resultDates;
  }

  DateConverter.packStartDates = function(date_arr) {
    var packed = date_arr.map(function(d) {
      return d.shortLabel + "=" + dateFormat(d.value, "yyyy-mm-dd");
    }).join("&");
    return packed;
  }

  return DateConverter;
});