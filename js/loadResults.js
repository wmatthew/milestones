define(function(require) {

  // Imports
  var Milestone = require('Milestone');

  // Set things up
  var startDates = getStartDates();

  var resultsContainer = document.getElementById("results_container");
  var resultCount = document.getElementById("result_count");
  var results = [];

  var all_checkboxes = [];

  function getStartDates() {
    var dateList = [];

    function addDate(newDate) {
      if (!dateList.some(function(x) {return newDate.text == x.text;})) {
        console.log("adding start date: " + newDate.text);
        dateList.push(newDate);
      } else {
        console.log("repeat date: " + newDate.text);
      }
    }

    // dates from URL
    var search = window.location.search.substr(1);
    unpackStartDates(search).map(addDate);

    // dates from localStorage
    if (localStorage) {
      var events = localStorage.getItem('events');
      if (events) {
        unpackStartDates(events).map(addDate);
      }
    }

    if (dateList.length == 0) {
      unpackStartDates("Christmas_2016=2016-12-25").map(addDate);
    }

    // write anything to localStorage if not there already
    if (localStorage) {
      localStorage.setItem('events', packStartDates(dateList));
    }

    return dateList;
  }

  // takes a query string (no leading question mark); returns array of dates
  function unpackStartDates(query_str) {
    var resultDates = [];

    for (chunk of query_str.split("&")) {
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

  function packStartDates(date_arr) {
    var packed = date_arr.map(function(d) {
      return d.shortLabel + "=" + dateFormat(d.value, "yyyy-mm-dd");
    }).join("&");
    console.log("Packed: " + packed);
    return packed;
  }

  function updateResults() {
    for (result of results) {
      result.set_visible(true);
      for (checkbox of all_checkboxes) {
        if (!checkbox.checked && checkbox.testing_function(result)) {
          result.set_visible(false);
        }
      }
    }
    resultCount.textContent = results.length + " results";
    console.log("Results updated.");
  }

  function loadDummyData() {
    for (direction of Milestone.DirectionValues) {
      for (start_date of startDates) {
        for (time_value of Milestone.TimeValueValues) {
          for (time_unit of Milestone.TimeUnitValues) {
            for (base_unit of Milestone.BaseUnitValues) {
              var res = document.createElement("p");
              var stone = new Milestone(start_date, res, time_unit, base_unit, time_value, direction);
              if (stone.valid) {
                resultsContainer.appendChild(res);
                results.push(stone);
              }
            }
          }
        }
      }
    }
  }

  // sort by date or by weight
  function sortResults(event) {
    var src = event.srcElement;
    var by_date = src.by_date;
    src.className = "inactive";
    src.otherLink.className = "";

    // remove everything
    while(resultsContainer.firstChild) {
      resultsContainer.removeChild(resultsContainer.firstChild);
    }

    // sort
    if (by_date) {
      console.log("Sorting by date.");
      results.sort(function(a,b) {return a.end_date - b.end_date});
    } else {
      console.log("Sorting by best match.");
      results.sort(function(a,b) {return b.weight - a.weight});
    }

    // add back in, in order
    for (result of results) {
      resultsContainer.appendChild(result.html_element);
    }
    return false;
  }

  function wireUpSortLinks() {
    var date_link = document.createElement("a");
    var best_link = document.createElement("a");

    var date_label = document.createTextNode("sort by date");
    date_link.appendChild(date_label);
    date_link.onclick = sortResults;
    date_link.by_date = true;
    date_link.otherLink = best_link;
    date_link.className = "inactive";

    var best_label = document.createTextNode("sort by best match");
    best_link.appendChild(best_label);
    best_link.onclick = sortResults;
    best_link.by_date = false;
    best_link.style.className += "inactive";
    best_link.otherLink = date_link;

    var sortContainer = document.getElementById("sort_links");
    sortContainer.appendChild(date_link);
    sortContainer.appendChild(document.createTextNode(" ... "));
    sortContainer.appendChild(best_link);
  }

  // show or hide one section
  function toggleOptionSection(event) {
    var src = event.srcElement;
    if (src.sectionHidden) {
      src.sectionHidden = false;
      src.textContent = "[-] ";
      src.targetSection.style.display = "block";
    } else {
      src.sectionHidden = true;
      src.textContent = "[+] ";
      src.targetSection.style.display = "none";
    }
  }

  function wireUpInputs() {
    var panel = document.getElementById("control_panel");

    function addSubpanel(heading, options, test_function) {
      var subpanel = document.createElement("div");
      panel.appendChild(subpanel);

      var head = document.createElement("h4");
      var headTitle = document.createTextNode(heading);
      subpanel.appendChild(head);

      var optionsSection = document.createElement("div");
      optionsSection.className = "optionsSection";
      optionsSection.style.display = "none";
      subpanel.appendChild(optionsSection);

      var collapseLink = document.createElement("a");
      collapseLink.sectionHidden = true;
      collapseLink.textContent = "[+] ";
      collapseLink.onclick = toggleOptionSection;
      collapseLink.targetSection = optionsSection;

      head.appendChild(collapseLink);
      head.appendChild(headTitle);

      for (option of options) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        if (option.text == "past") checkbox.checked = false;
        checkbox.onchange = updateResults;
        checkbox.testing_function = test_function.bind(undefined, option);
        optionsSection.appendChild(checkbox);
        all_checkboxes.push(checkbox);

        var label = document.createTextNode(option.text);
        optionsSection.appendChild(label);

        optionsSection.appendChild(document.createElement("br"));
      }
    }

    addSubpanel("Event", startDates, function(start_date, stone) {
      return stone.start_date === start_date;
    });

    addSubpanel("Number", Milestone.TimeValueValues, function(time_value, stone) {
      return stone.time_value === time_value;
    });

    addSubpanel("Unit", Milestone.TimeUnitValues, function(time_unit, stone) {
      return stone.time_unit === time_unit;
    });

    addSubpanel("Base", Milestone.BaseUnitValues, function(base_unit, stone) {
      return stone.base_unit === base_unit;
    });

    addSubpanel("Milestone", Milestone.EraValues, function(era, stone) {
      return stone.era === era;
    });

    addSubpanel("Before / After Event", Milestone.DirectionValues, function(direction, stone) {
      return stone.direction === direction;
    });
  }

  wireUpInputs();
  wireUpSortLinks();
  loadDummyData();
  updateResults();
});

