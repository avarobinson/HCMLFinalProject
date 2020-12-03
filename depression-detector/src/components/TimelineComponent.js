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

  //creates initial year-timespan, then aggregates data by year 
  function groupByYear(data, start, end) {
    data.sort((a, b) => (a.date > b.date) ? 1 : -1)

    var timeline_data = [];
    var template = [];
    var startYear = parseInt(start.year);
    var endYear = parseInt(end.year);
    var i
    for (i = startYear; i <= endYear; i++) {
      timeline_data.push({ date: i, risk: 0, total: 0, percent: 0 });
      template.push(i);
    }

    return [timeline_data, template, "year"];
  }

  //creates initial season-timespan, then aggregates data by season (dividing a year into 4 parts)
  function groupBySeason(data, start, end) {
    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    var timeline_data = [];
    var template = [];
    var startSeason = (parseInt(start.month) === 12) ? 3 : Math.floor(parseInt(start.month) / 3);
    var endSeason = (parseInt(end.month) === 12) ? 3 : Math.floor(parseInt(end.month) / 3);

    var startYear = parseInt(start.year);
    var numSeasons = (endSeason - startSeason) + (4 * (parseInt(end.year) - parseInt(start.year)));

    if(numSeasons > 20){
      return groupByYear(data, start, end);
    }

    var i
    for (i = startSeason; i <= (startSeason + numSeasons); i++) {
      timeline_data.push({ date: season[i % 4] + " " + startYear, risk: 0, total: 0, percent: 0 });
      template.push(season[i % 4] + " " + startYear);
      if (i % 4 === 0) {
        startYear++;
      }
    }
    return [timeline_data, template, "season"];
  }

  //creates initial month-timespan, then aggregates data by month
  function groupByMonth(data, start, end) {

    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    var timeline_data = [];
    var template = [];
    var startMonth = parseInt(start.month);
    var startYear = parseInt(start.year);

    var numMonths = (parseInt(end.month) - parseInt(start.month)) + (12 * (parseInt(end.year) - parseInt(start.year)));

    if (numMonths > 16) {
      return groupBySeason(data, start, end);
    }

    var i
    for (i = startMonth; i <= (startMonth + numMonths); i++) {
      if (i % 12 === 0) {
        timeline_data.push({ date: month[12] + " " + startYear, risk: 0, total: 0, percent: 0 });
        template.push(month[12] + " " + startYear);
        startYear++;
      } else {
        timeline_data.push({ date: month[(i % 12)] + " " + startYear, risk: 0, total: 0, percent: 0 });
        template.push(month[i % 12] + " " + startYear);
      }
    }
    return [timeline_data, template, "month"];
  }

  //creates initial timespan, then aggregates data by date
  function groupByDate(data, start, end) {

    var thirty = [1, 3, 5, 7, 8, 10, 12];
    var thirtyone = [4, 6, 9, 11];
    var leap = [2008, 2012, 2016, 2020];

    data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    
    var timeline_data = [];
    var template = [];

    var startYear = parseInt(start.year);
    var startMonth = parseInt(start.month);
    var endMonth = parseInt(end.month);
    var startDay = parseInt(start.date);
    var endDay = parseInt(end.date);

    var numDays;
    if (endMonth === startMonth) { //if all the dates are within the same month 
      numDays = endDay - startDay;
    } else { //if the dates span throughout two months 
      if (startMonth === 2) { //corner case for february (leap year)
        numDays = (leap.indexOf(startYear) !== -1) ? (29 - startDay) : (28 - startDay);
      } else { //calculating the number of days for a regular month 
        numDays = (thirty.indexOf(startMonth) !== -1) ? (30 - startDay) : (31 - startDay);
      }
      numDays += endDay;
    }
    
    if(numDays === 0){ //corner case if we are only given one date 
      timeline_data.push({ date: month[startMonth] + " " + startDay, risk: 0, total: 0, percent: 0 });
      template.push(month[startMonth] + " " + startDay);
    }else{
      var i;
      for (i = 0; i < numDays; i++) {
        timeline_data.push({ date: month[startMonth] + " " + startDay, risk: 0, total: 0, percent: 0 });
        template.push(month[startMonth] + " " + startDay);
        startDay++;
        var end1 = (startDay === 30 && thirty.indexOf(startMonth) !== -1);
        var end2 = (startDay === 31 && thirtyone.indexOf(startMonth) !== -1);
        var end3 = (startDay === 29 && startMonth === 2 && leap.indexOf(startYear) !== -1);
        var end4 = (startDay === 28 && startMonth === 2 && leap.indexOf(startYear) === -1);

        //checks if it is time to move on to the next month 
        if (end1 || end2 || end3 || end4) { 
          startMonth = (startMonth === 12 ? 1 : startMonth + 1);
          startDay = 1;
        }
      }
    }

    return [timeline_data, template, "date"];
  }


  function reorganizeData(results) {
    if (results.length === 0) {
      return results;
    } else {
      results.sort((a, b) => (a.date > b.date) ? 1 : -1)
   
      var array = [];
      const start = { year: (results[0].date.split("-")[0]), month: (results[0].date.split("-")[1]), date: (results[0].date.split("-")[2]) };
      const end = { year: (results[results.length - 1].date.split("-")[0]), month: (results[results.length - 1].date.split("-")[1]), date: (results[results.length - 1].date.split("-")[2]) };
      
      if (timeframe === "past year" || timeframe === "all time") {
        array = groupByMonth(results, start, end);
      } else {
        array = groupByDate(results, start, end);
      }


     var data = array[0];
      var template = array[1];
      var type = array[2];
      var i;

      for (i = 0; i < results.length; i++) {
        var date = results[i].date.split("-");
        var value = "";
        var index = 0;

        if(type === "date"){
           value = month[parseInt(date[1])] + " " + parseInt(date[2]);
        }else if(type === "month"){
          value  = month[parseInt(date[1])] + " " + date[0];
        }else if(type === "season"){
          var test = parseInt(date[1])
          var currNum = (test === 12) ? 3 : Math.floor(test / 3);
          value = season[currNum] + " " + date[0];
        }else{
          value = parseInt(date[0]);
        }
        index = template.indexOf(value);
        data[index].total++;
        data[index].risk += results[i].risk;
      }

      for (i = 0; i < data.length; i++) {
        if (data[i].total === 0) {
          data[i] = { date: data[i].date };
        } else {
          data[i].percent = ((data[i].risk * 100) / (data[i].total)).toFixed(2);
        }
      }
  

      return data; 
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
