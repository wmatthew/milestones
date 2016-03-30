define(function(require) {

  // Imports
  var Milestone = require('Milestone');
  var FilterConstants = require('FilterConstants');
  var DateConverter = require('DateConverter');

  // Set things up
  var startDates = getStartDates();

  var resultsContainer = document.getElementById("results_container");
  var resultCount = document.getElementById("result_count");
  var resultsHeader = document.getElementById("results_header");
  var results = [];

  var all_checkboxes = [];

  function getStartDates() {
    var dateList = [];

    function addDate(newDate) {
      // Generous dupe policy: allow different labels on same date, different dates w same label.
      if (dateList.some(function(x) {return newDate.text == x.text;})) {
        console.log("repeat date: " + newDate.text);
      } else {
        // console.log("adding start date: " + newDate.text);
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
    }

    if (localStorage) {
      localStorage.setItem('events', DateConverter.packStartDates(dateList));
    }

    return dateList;
  }

  // After a filter has been toggled, update results (change visibility of elements)
  function updateResults() {
    var visible_count = 0;
    for (result of results) {
      result.set_visible(true);
      for (checkbox of all_checkboxes) {
        if (!checkbox.checked && checkbox.testing_function(result)) {
          result.set_visible(false);
        }
      }
      if (result.is_visible()) visible_count++;
    }

    if (visible_count === results.length) {
      resultCount.textContent = "showing all " + results.length + " results";
    } else {
      resultCount.textContent = "showing " + visible_count + " of " + results.length + " results";
    }
    console.log("Result filtering updated.");
  }

  function generateMilestones() {
    function addMilestone(stone) {
      if (stone && stone.valid) {
        var res = document.createElement("p");
        stone.attachElement(res);
        resultsContainer.appendChild(res);
        results.push(stone);
      }
    }

    // Basic numbers (1, 10, 100...) in all bases
    for (direction of FilterConstants.DirectionValues) {
      for (start_date of startDates) {
        for (magnitude of FilterConstants.MagnitudeValues) {
          for (time_unit of FilterConstants.TimeUnitValues) {
            for (base_unit of FilterConstants.BaseValues) {
              addMilestone(Milestone.baseMilestone(start_date, time_unit, magnitude, direction, base_unit));
            }
          }
        }
      }
    }

    // Repeated digits (111, 222, 333 ...) base 10 only
    for (direction of FilterConstants.DirectionValues) {
      for (start_date of startDates) {
        for (magnitude of FilterConstants.MagnitudeValues) {
          for (time_unit of FilterConstants.TimeUnitValues) {
            for (repeat of FilterConstants.RepeatingDigitValues) {
              addMilestone(Milestone.repeatDigitMilestone(start_date, time_unit, magnitude, direction, repeat));
            }
          }
        }
      }
    }

    // TODO: speed load time up, then add this back in.
    //
    // Two leading digits: (12000, 13000, 14000). base 10 only.
    // for (direction of FilterConstants.DirectionValues) {
    //   for (start_date of startDates) {
    //     for (magnitude of FilterConstants.MagnitudeValues) {
    //       for (time_unit of FilterConstants.TimeUnitValues) {
    //         for (prefix of FilterConstants.TwoDigitPrefixValues) {
    //           addMilestone(Milestone.prefixMilestone(start_date, time_unit, magnitude, direction, prefix));
    //         }
    //       }
    //     }
    //   }
    // }

    // TODO: Possible future additions:
    // One leading digit:  2000, 3000, 4000...
    // Sequences:          123, 1234, 12345, ...
    // Constants           3.14159, 31.4159, ...
  }

  function sortEvent(event) {
    var src = event.srcElement;
    sortResults(src);
  }

  // sort by date or by weight
  function sortResults(src) {
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

    var date_label = document.createTextNode("date");
    date_link.appendChild(date_label);
    date_link.id = "date_link";
    date_link.onclick = sortEvent;
    date_link.by_date = true;
    date_link.otherLink = best_link;

    var best_label = document.createTextNode("best match");
    best_link.appendChild(best_label);
    best_link.onclick = sortEvent;
    best_link.by_date = false;
    best_link.otherLink = date_link;

    var sortContainer = document.getElementById("sort_links");
    sortContainer.appendChild(document.createTextNode("Sort by "));
    sortContainer.appendChild(date_link);
    sortContainer.appendChild(document.createTextNode(" / "));
    sortContainer.appendChild(best_link);
  }

  // show or hide one section
  function toggleOptionSectionEvent(event) {
    var node = event.srcElement;
    toggleOptionSection(node);
  }

  function toggleOptionSection(node) {
    if (node.sectionHidden) {
      node.sectionHidden = false;
      node.textContent = "[-] ";
      node.targetSection.style.display = "block";
    } else {
      node.sectionHidden = true;
      node.textContent = "[+] ";
      node.targetSection.style.display = "none";
    }
  }

  function wireUpInputs() {
    var panel = document.getElementById("control_panel");

    function addSubpanel(heading, options, test_function) {
      var subpanel = document.createElement("div");
      if (heading == "Event") { subpanel.className = "events"; }
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
      collapseLink.className = "collapseLink";
      collapseLink.onclick = toggleOptionSectionEvent;
      collapseLink.targetSection = optionsSection;

      var allLink = document.createElement("a");
      allLink.textContent = "all";
      allLink.className = "allLink";
      allLink.onclick = checkAllHandler;
      allLink.targetSection = optionsSection;

      head.appendChild(collapseLink);
      head.appendChild(headTitle);
      head.appendChild(allLink);

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

        var onlyLink = document.createElement("a");
        onlyLink.textContent = "only";
        onlyLink.className = "onlyLink";
        onlyLink.onclick = onlyThisOptionHandler;
        onlyLink.targetSection = optionsSection;
        onlyLink.targetLink = checkbox;
        optionsSection.appendChild(onlyLink);

        optionsSection.appendChild(document.createElement("br"));
      }
    }

    function checkAllHandler(event) {
      var node = event.srcElement;
      var checkBoxes = node.targetSection.getElementsByTagName("input");
      for (var i=0; i<checkBoxes.length; i++) {
        var child = checkBoxes[i];
        child.checked = true;
      }
      updateResults();
    }

    function onlyThisOptionHandler(event) {
      var node = event.srcElement;
      var checkBoxes = node.targetSection.getElementsByTagName("input");
      for (var i=0; i<checkBoxes.length; i++) {
        var child = checkBoxes[i];
        child.checked = false;
      }
      node.targetLink.checked = true;
      updateResults();
    }

    addSubpanel("Event", startDates, function(start_date, stone) {
      return stone.start_date === start_date;
    });

    // TODO: add [x] links next to events

    // Doesn't work yet
    // var dummyNumTypes = [
    //   {text: "repeat (eg 7777)"},
    //   {text: "round (eg 6700)"},
    //   {text: "very round (eg 6000)"},
    //   {text: "power of 10 (eg 10000)"}
    // ];
    // addSubpanel("Number", dummyNumTypes, function(a,b){return false;});

    // Rename to number length ? made it a slider?
    // addSubpanel("Number", FilterConstants.MagnitudeValues, function(magnitude, stone) {
    //   return stone.magnitude === magnitude;
    // });

    addSubpanel("Unit", FilterConstants.TimeUnitValues, function(time_unit, stone) {
      return stone.time_unit === time_unit;
    });

    addSubpanel("Base", FilterConstants.BaseValues, function(base_unit, stone) {
      return stone.base_unit === base_unit;
    });

    addSubpanel("Repeat", FilterConstants.RepeatingDigitValues, function(repeat, stone) {
      return stone.repeat === repeat;
    });

    addSubpanel("Past / Future", FilterConstants.EraValues, function(era, stone) {
      return stone.era === era;
    });

    addSubpanel("Before / After Event", FilterConstants.DirectionValues, function(direction, stone) {
      return stone.direction === direction;
    });
  }

  wireUpInputs();
  wireUpSortLinks();
  generateMilestones();
  updateResults();
  sortResults(document.getElementById("date_link"));
  // Open the first two sections
  toggleOptionSection(document.getElementsByClassName("collapseLink")[0]);
  toggleOptionSection(document.getElementsByClassName("collapseLink")[1]);
  // Loading is complete.
  resultsHeader.textContent="Results";
});

