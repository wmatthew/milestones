"use strict";
define(function(require) {

  require('main/BasicUtils');
  var EventsPrefix="events=";

  function DateConverter() {}

  DateConverter.prototype = {}

  // takes a query string (no leading question mark); returns array of dates
  DateConverter.unpackStartDates = function(query_str) {
    var resultDates = [];

    for (var chunk of query_str.split("&")) {
      if (chunk.startsWith(EventsPrefix)) {
        chunk = chunk.substr(EventsPrefix.length);
        for (var subchunk of chunk.split(';')) {
          var pair = subchunk.split("=");
          if (pair.length !== 2) {
            continue;
          }

          var label = pair[0].replaceAll('_', ' ');
          var dateParts = pair[1].split("-"); // YYYY-MM-DD format only
          var date = new Date(dateParts[0], dateParts[1]-1, dateParts[2]);

          if (isNaN(date)) {
            console.log("dropping invalid date: " + chunk);
            continue;
          }

          resultDates.push(DateConverter.toHash(date, label));
        }
      }
    }

    return resultDates;
  }

  // Convert a date from date+label to object
  DateConverter.toHash = function(date, label) {
    if (isNaN(date)) {
      return false;
    }
    label = label.replaceAll('&','').replaceAll('?','').replaceAll('=','').replaceAll(';','');
    var dateText = label + " (" + dateFormat(date, "mmm dS, yyyy") + ")";
    return {
      value: date,
      text: dateText,
      shortLabel: label
    };
  }

  // Convert from array of objects to URL format
  DateConverter.packStartDates = function(date_arr) {
    var packed = date_arr.map(function(d) {
      var packedLabel = d.shortLabel.replaceAll(' ', '_');
      return packedLabel + "=" + dateFormat(d.value, "yyyy-mm-dd");
    }).join(";");
    return EventsPrefix+packed;
  }

  DateConverter.overwriteLocalStorageDates = function(dateList) {
    if (localStorage) {
      localStorage.setItem('events', DateConverter.packStartDates(dateList));
    }
  }

  // Gather current start dates from URL, localStorage, and default dates list.
  DateConverter.getStartDates = function() {
    var dateList = [];
    var gotAnyDatesFromURL = false;
    var redirectToSimpleUrl = false;

    function addDate(newDate) {
      // Generous dupe policy: allow different labels on same date, different dates w same label.
      if (dateList.some(function(x) {return newDate.text == x.text;})) {
        console.log("repeat date: " + newDate.text);
      } else {
        dateList.push(newDate);
      }
    }

    // TODO:
    // if (r=1 GET param is set) {
    //   redirectToSimpleUrl = true;
    // }

    // dates from URL
    var search = decodeURI(window.location.search.substr(1));
    DateConverter.unpackStartDates(search).map(addDate);
    if (dateList.length > 0) {
      gotAnyDatesFromURL = true;
    }

    // dates from localStorage
    if (localStorage) {
      var events = localStorage.getItem('events');
      if (events) {
        DateConverter.unpackStartDates(events).map(addDate);
      }
    }

    // Result page doesn't look good empty. Add an event so there's something to see.
    if (dateList.length == 0) {
      DateConverter.unpackStartDates("events=Christmas_2016=2016-12-25").map(addDate);
      DateConverter.unpackStartDates("events=Obama's Birth=1961-08-04").map(addDate);
      DateConverter.unpackStartDates("events=Elizabeth II's Birth=1926-04-21").map(addDate);
      DateConverter.unpackStartDates("events=Bastille Day=1789-07-14").map(addDate);
    }

    DateConverter.overwriteLocalStorageDates(dateList);

    // redirect to a simpler URL if we've stored events from GET params to localStorage.
    if (gotAnyDatesFromURL && redirectToSimpleUrl) {
      if (localStorage && localStorage.getItem('events')) {
        var newDest = window.location.protocol + "//" +
              window.location.host +
              window.location.pathname
        document.location.href = newDest;
      }
    }

    return dateList;
  }

  return DateConverter;
});