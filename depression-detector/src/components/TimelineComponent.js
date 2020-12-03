import React, { Component, useEffect, useRef, useState } from "react";
import '../App.css';
import { AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function CustomTooltip({ payload, active }) {
  if (active) {
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

const Timeline = ({ results }) => {
  //const [tooltip, setTooltip]

  function reorganizeData(results) {
    //initially sort and organize by date
    if (results.length === 0) {
      return results;
    }
    results.sort((a, b) => (a.date > b.date) ? 1 : -1)
    var data = [];

    //dividing original results by date
    var i;
    for (i = 0; i < results.length; i++) {
      var len = data.length;
      if (len !== 0 && data[len - 1].date === results[i].date) {
        if (results[i].risk === 0){
          data[len - 1].risk++;
        } 
          data[len - 1].total++;
 
      }else{
        data.push({ date: results[i].date, risk: (results[i].risk === 1 ? 1 : 0), total: 1, percent: 0 })
      }
    }

    //getting average afer sorting into dates 
    for(i = 0; i < data.length; i++){
      data[i].percent = ((data[i].risk * 100) / (data[i].total)).toFixed(2);
    }
    return data
  }
  var data = reorganizeData(results);

  return (
    <AreaChart width={1000} height={500} data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
      {/* <Line type="monotone" dataKey="percent" stroke="#8884d8" /> */}
      <Area type="monotone" dataKey="percent" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} /> 
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="date" />
      <YAxis dataKey = "percent"/>
     {data.length !== 0 ? <Tooltip  content = {<CustomTooltip/>} /> : null}
    </AreaChart>
  );
}


export default Timeline;
