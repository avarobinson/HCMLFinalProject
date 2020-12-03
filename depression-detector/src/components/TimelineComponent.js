import React, { Component, useEffect, useRef, useState } from "react";
import '../App.css';
import { AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function CustomTooltip({ payload, active }) {

  if (active && payload.length !== 0) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`percent : ${payload[0].payload.percent}%`}</p>
        <p className="risk">{`at-risk tweets: ${payload[0].payload.risk}`}</p>
        <p className="risk">{`total tweets: ${payload[0].payload.total}`}</p>
      </div>
    );
  }

  return null;
}

const Timeline = ({ results, timeframe }) => {
  const month = ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const season = ["winter", "spring", "summer", "fall"];

  function groupBySeason(data) {
    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    const startDate = { year: (data[0].date.split("-")[0]), month: (data[0].date.split("-")[1]) };
    const endDate = { year: (data[data.length - 1].date.split("-")[0]), month: (data[data.length - 1].date.split("-")[1]) };

    var dateArray = [];
    var dateTracker = [];
    var startSeason = (parseInt(startDate.month) === 12) ? 3 : Math.floor(parseInt(startDate.month) / 3);
    var endSeason = (parseInt(endDate.month) === 12) ? 3 : Math.floor(parseInt(endDate.month) / 3);

    var startYear = parseInt(startDate.year);

    var numSeasons = (endSeason - startSeason) + (4 * (parseInt(endDate.year) - parseInt(startDate.year)));

    var i
    for (i = startSeason; i <= (startSeason + numSeasons); i++) {
      dateArray.push({ date: season[i % 4] + " " + startYear, risk: 0, total: 0, percent: 0 });
      dateTracker.push(season[i % 4] + " " + startYear);
      if (i % 4 === 0) {
        startYear++;
      }
    }
    for (i = 0; i < data.length; i++) {
      var date = data[i].date.split("-");
      var test = parseInt(date[1])

      var currNum = (test === 12) ? 3 : Math.floor(test / 3);
      var currMonth = season[currNum] + " " + date[0];

      var index = dateTracker.indexOf(currMonth);

      dateArray[index].total++;
      dateArray[index].risk += data[i].risk;
    }

    return dateArray;
  }

  function groupByMonth(data) {

    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    const startDate = { year: (data[0].date.split("-")[0]), month: (data[0].date.split("-")[1]) };
    const endDate = { year: (data[data.length - 1].date.split("-")[0]), month: (data[data.length - 1].date.split("-")[1]) };
    var dateArray = [];
    var dateTracker = [];
    var startMonth = parseInt(startDate.month);
    var startYear = parseInt(startDate.year);

    var numMonths = (parseInt(endDate.month) - parseInt(startDate.month)) + (12 * (parseInt(endDate.year) - parseInt(startDate.year)));

    if (numMonths > 16) {
      return groupBySeason(data);
    }

    var i
    for (i = startMonth; i <= (startMonth + numMonths); i++) {
      if (i % 12 === 0) {
        dateArray.push({ date: month[12] + " " + startYear, risk: 0, total: 0, percent: 0 });
        dateTracker.push(month[12] + " " + startYear);
        startYear++;
      } else {
        dateArray.push({ date: month[(i % 12)] + " " + startYear, risk: 0, total: 0, percent: 0 });
        dateTracker.push(month[i % 12] + " " + startYear);
      }
    }

    for (i = 0; i < data.length; i++) {
      var date = data[i].date.split("-");
      var currMonth = month[parseInt(date[1])] + " " + date[0];

      var index = dateTracker.indexOf(currMonth);

      dateArray[index].total++;
      dateArray[index].risk += data[i].risk;

    }

    return dateArray;
  }


  function groupByDate(data) {
    var thirty = [1, 3, 5, 7, 8, 10, 12];
    var thirtyone = [4, 6, 9, 11];
    var leap = [2008, 2012, 2016, 2020];

    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    const startDate = { date: (data[0].date.split("-")[2]), month: (data[0].date.split("-")[1]) };
    const endDate = { date: (data[data.length - 1].date.split("-")[2]), month: (data[data.length - 1].date.split("-")[1]) };
    var dateArray = [];
    var dateTracker = [];
    var startMonth = parseInt(startDate.month);
    var startYear = parseInt(startDate.year);
    var endMonth = parseInt(endDate.month);

    var startDay = parseInt(startDate.date);
    var endDay = parseInt(endDate.date);
    var lastStart;
    if (endMonth === startMonth) {
      lastStart = endDay - startDay;
    } else {
      if (startMonth === 2) {
        lastStart = (leap.indexOf(startYear) !== -1) ? (29 - startDay) : (28 - startDay);
      } else {
        lastStart = (thirty.indexOf(startMonth) !== -1) ? (30 - startDay) : (31 - startDay);
      }
      lastStart += endDay;
    }

    var i;
    for (i = 0; i <= lastStart; i++) {
      dateArray.push({ date: month[startMonth] + " " + startDay, risk: 0, total: 0, percent: 0 });
      dateTracker.push(month[startMonth] + " " + startDay);
      startDay++;
      var end1 = (startDay === 30 && thirty.indexOf(startMonth) !== -1);
      var end2 = (startDay === 31 && thirtyone.indexOf(startMonth) !== -1);
      var end3 = (startDay === 29 && startMonth === 2 && leap.indexOf(startYear) !== -1);
      var end4 = (startDay === 28 && startMonth === 2 && leap.indexOf(startYear) === -1);

      if (end1 || end2 || end3 || end4) {
        startMonth = (startMonth === 12 ? 1 : startMonth + 1);
        startDay = 1;
      }
    }

    for (i = 0; i < data.length; i++) {
      var date = data[i].date.split("-");
      var currMonth = month[parseInt(date[1])] + " " + parseInt(date[2]);
      var index = dateTracker.indexOf(currMonth);
      dateArray[index].total++;
      dateArray[index].risk += data[i].risk;
    }

    return dateArray;
  }

  function reorganizeData(results) {
    if (results.length === 0) {
      return results;
    } else {
      var array = []
      if (timeframe === "past year" || timeframe === "all time") {
        array = groupByMonth(results);
      } else {
        array = groupByDate(results);
      }

      var i;
      for (i = 0; i < array.length; i++) {
        if (array[i].total === 0) {
          array[i] = { date: array[i].date };
        } else {
          array[i].percent = ((array[i].risk * 100) / (array[i].total)).toFixed(2);
        }
      }

      return array;
    }
  }

  var data = reorganizeData(results);

  return (
    <AreaChart width={1000} height={500} data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
      <Area connectNulls type="monotone" dataKey="percent" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="date" />
      <YAxis dataKey="percent" />
      {data.length !== 0 ? <Tooltip content={<CustomTooltip />} /> : null}
    </AreaChart>
  );
}

export default Timeline;
