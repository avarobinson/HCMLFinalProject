import React, { useState, useEffect, useRef } from "react";
import '../App.css';
import { AreaChart, Area, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Col, Row, } from 'react-bootstrap';
import PieChart from './PieChartComponent';

//custom tooltip to show data when hovering over points 
function CustomTooltip({ payload, active }) {
  // console.log(payload);
  if (active && payload.length !== 0) {
    var timeframe = payload[0].payload.timeframe;
    var startDate = timeframe[0];
    var endDate = timeframe[timeframe.length - 1];
    var range;

    //creates range of dates the data is aggregated from for each grouping 
    if (startDate === endDate) {
      range = startDate;
    } else {
      range = startDate + " to " + endDate;
    }
    return (
      <div className="custom-tooltip">
        <p className="risk"> {`${range}`}</p>
        <p className="labelRisk">{`percent : ${payload[0].payload.percent}%`}</p>
        <p className="labelCont">{`continuous percent : ${payload[0].payload.contPercent}%`}</p>
      </div>
    );
  }
  return null;
}

const Timeline = ({ results, timeframe }) => {

  const month = ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const season = ["winter", "spring", "summer", "fall"];
  const [startDate, setStart] = useState(results.length === 0 ? '' : results[0].date);
  const [endDate, setEnd] = useState(results.length === 0 ? '' : results[results.length - 1].date);
  const [pieChartData, setPieChartData] = useState(results);
  const formStart = useRef(null);
  const formEnd = useRef(null);


  function handleFilter(event) {
    const value = event.target.value;
    const name = event.target.name;


    if (name === "startDate") {
      setStart(value);
    } else {
      setEnd(value);
    }
  }

  useEffect(() => {
    if (results.length !== 0) {
      var piechartData = results;
      // piechartData.sort((a, b) => (a.date > b.date) ? 1 : -1)
      var newData = [];
      var start = (startDate === '') ? piechartData[0].date : startDate;
      var end = (endDate === '') ? piechartData[piechartData.length - 1].date : endDate;
      var i;
      for (i = 0; i < piechartData.length; i++) {
        if (piechartData[i].date >= start && piechartData[i].date <= end) {
          newData.push(piechartData[i]);
        }
      }
      setPieChartData(newData);
    }
  }, [startDate, endDate, results])


  //creates initial year-timespan, then aggregates data by year 
  function groupByYear(data, start, end) {
    data.sort((a, b) => (a.date > b.date) ? 1 : -1)

    var timeline_data = [];
    var template = [];
    var startYear = parseInt(start.year);
    var endYear = parseInt(end.year);
    var i
    for (i = startYear; i <= endYear; i++) {
      timeline_data.push({ date: i, risk: 0, total: 0, contRisk: 0, contTotal: 0, contPercent: 0, percent: 0, timeframe: [] });
      template.push(i);
    }

    return [timeline_data, template, "year"];
  }

  //creates initial season-timespan, then aggregates data by season (dividing a year into 4 parts)
  function groupBySeason(data, start, end) {
    // data.sort((a, b) => (a.date > b.date) ? 1 : -1)
    var timeline_data = [];
    var template = [];
    var startSeason = (parseInt(start.month) === 12) ? 3 : Math.floor(parseInt(start.month) / 3);
    var endSeason = (parseInt(end.month) === 12) ? 3 : Math.floor(parseInt(end.month) / 3);

    var startYear = parseInt(start.year);
    var numSeasons = (endSeason - startSeason) + (4 * (parseInt(end.year) - parseInt(start.year)));

    if (numSeasons > 20) {
      return groupByYear(data, start, end);
    }

    var i
    for (i = startSeason; i <= (startSeason + numSeasons); i++) {
      timeline_data.push({ date: season[i % 4] + " " + startYear, risk: 0, total: 0, contRisk: 0, contTotal: 0, contPercent: 0, percent: 0, timeframe: [] });
      template.push(season[i % 4] + " " + startYear);
      if (i % 4 === 0) {
        startYear++;
      }
    }
    return [timeline_data, template, "season"];
  }

  //creates initial month-timespan, then aggregates data by month
  function groupByMonth(data, start, end) {

    // data.sort((a, b) => (a.date > b.date) ? 1 : -1)
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
        timeline_data.push({ date: month[12] + " " + startYear, risk: 0, total: 0, contRisk: 0, contTotal: 0, contPercent: 0, percent: 0, timeframe: [] });
        template.push(month[12] + " " + startYear);
        startYear++;
      } else {
        timeline_data.push({ date: month[(i % 12)] + " " + startYear, risk: 0, total: 0, contRisk: 0, contTotal: 0, contPercent: 0, percent: 0, timeframe: [] });
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

    // data.sort((a, b) => (a.date > b.date) ? 1 : -1)

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

    if (numDays === 0) { //corner case if we are only given one date 
      timeline_data.push({ date: month[startMonth] + " " + startDay, risk: 0, total: 0, contRisk: 0, contTotal: 0, contPercent: 0, percent: 0, timeframe: [] });
      template.push(month[startMonth] + " " + startDay);
    } else {
      var i;
      for (i = 0; i < numDays; i++) {
        timeline_data.push({ date: month[startMonth] + " " + startDay, risk: 0, total: 0, contRisk: 0, contTotal: 0, contPercent: 0, percent: 0, timeframe: [] });
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

  //helper function that reorganizes the data - decides how the data should be aggregated 
  function reorganizeData(results) {
    if (results.length === 0) {
      return results;
    } else {
      // results.sort((a, b) => (a.date > b.date) ? 1 : -1)

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
      var continuous = 0;

      for (i = 0; i < results.length; i++) {
        var date = results[i].date.split("-");
        var value = "";
        var index = 0;

        if (type === "date") {
          value = month[parseInt(date[1])] + " " + parseInt(date[2]);
        } else if (type === "month") {
          value = month[parseInt(date[1])] + " " + date[0];
        } else if (type === "season") {
          var test = parseInt(date[1])
          var currNum = (test === 12) ? 3 : Math.floor(test / 3);
          value = season[currNum] + " " + date[0];
        } else {
          value = parseInt(date[0]);
        }
        index = template.indexOf(value);
        continuous += results[i].risk;

        data[index].total++;
        data[index].timeframe.push(results[i].date);
        data[index].contRisk = continuous;
        data[index].contTotal = i + 1;
        data[index].risk += results[i].risk;
      }

      for (i = 0; i < data.length; i++) {
        if (data[i].total === 0) {
          data[i] = { date: data[i].date };
        } else {

          data[i].contPercent = ((data[i].contRisk * 100) / (data[i].contTotal)).toFixed(2);
          data[i].percent = ((data[i].risk * 100) / (data[i].total)).toFixed(2);
        }
      }

      return data;
    }
  }

  //data used to create the line chart 
  var data = reorganizeData(results);

  function setTimeframe(index) {
    // console.log(payload.value);
    // console.log(data[index])
    var timeframe = data[index].timeframe;
    var startDate = timeframe[0];
    var endDate = timeframe[timeframe.length - 1];
    setStart(startDate);
    setEnd(endDate);
    formStart.current.value = startDate;
    formEnd.current.value = endDate;
  }

  return (
    <div>
      <div className = "linechart"> 
      <p className = "graph-title"> Risk of Depression Over Time</p>
      <p className = "description"> click on the data points for more details via the pie chart</p>
      <AreaChart onMouseDown={results.length === 0 ? null : (e) => setTimeframe(e.activeTooltipIndex)} width={1000} height={500} data={data} margin={{ top: 0, right: 20, bottom: 5, left: 0 }}>
        <Area name="continuous risk %" connectNulls type="monotone" dataKey="contPercent" stroke="#247893" fill="#247893" fillOpacity={0.4} activeDot={{ r: 8 }} />
        <Area name="current timeframe risk %" connectNulls type="monotone" dataKey="percent" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} activeDot={{ r: 8 }} />

        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis dataKey="percent" domain={[0, 100]} />
        {data.length !== 0 ? <Tooltip content={<CustomTooltip />} /> : null}
        <Legend />
      </AreaChart>
      </div>
      
      <div className = "piechart">
      {results.length === 0 ?
      <p className = "graph-title"> Categorized Tweets </p> : <p className = "graph-title"> Categorized Tweets Between {startDate} and {endDate}</p>}
      <p className = "description"> view the categorized tweets for a specific timeframe </p>
        {(results.length === 0) ? null :
          <Row>
            <Col></Col>
            <Col>
              <label htmlFor="startDate">start date: </label>
              <input ref={formStart} type="date" id="startDate" name="startDate" onChange={handleFilter}></input>
            </Col>
            <Col>
              <label htmlFor="endDate">end date: </label>
              <input ref={formEnd} type="date" id="endDate" name="endDate" onChange={handleFilter}></input>
            </Col>
            <Col></Col>
          </Row>
        }
        <PieChart results={pieChartData} />
      </div>
    </div>
  );
}

export default Timeline;
