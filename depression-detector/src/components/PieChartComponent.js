

// const PieChart = props => {
//   var width = 500;
//   var height = 500;
//   var outerRadius = Math.min(width, height) / 2;
//   var innerRadius = outerRadius * .50; 

import React, { useEffect } from 'react';
import * as d3 from 'd3';

const PieChart = ({results}) => {

  const margin = {
    top: 50, right: 50, bottom: 50, left: 50,
  };

  function reorganizeData (results){
    var risk = 0;
    var noRisk = 0;

    var i;
    for(i = 0; i < results.length; i++){
      if(results[i].risk == 0){
        noRisk++;
      }else{
        risk++;
      }
    }
    risk = risk*100/results.length;
    noRisk = noRisk*100/results.length;
    
    return [{ label: "risk", value: risk}, {label: "no risk", value: noRisk}];
  }

  const data = reorganizeData(results);

  var outerRadius = 250;
  var innerRadius = 175; 

  const width = 2 * outerRadius + margin.left + margin.right;
  const height = 2 * outerRadius + margin.top + margin.bottom;
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    drawChart();
  }, [data]);

  function drawChart() {
    // Remove the old svg
    d3.select('#piechart')
      .select('svg')
      .remove();

    // Create new svg
    const svg = d3
      .select('#piechart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const pieGenerator = d3
      .pie()
      .padAngle(0)
      .value((d) => d.value);

    const arc = svg
      .selectAll()
      .data(pieGenerator(data))
      .enter();

    // Append arcs
    arc
      .append('path')
      .attr('d', arcGenerator)
      .style('fill', (_, i) => colors(i));

    // Append text labels
    arc
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.data.label)
      .style('fill', 'white')
      .attr('transform', (d) => {
        const [x, y] = arcGenerator.centroid(d);
        return `translate(${x}, ${y})`;
      });
  }    

  return (<div id="piechart" />);
}

export default PieChart;