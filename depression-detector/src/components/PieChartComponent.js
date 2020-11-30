import React, { useEffect } from 'react';
import * as d3 from 'd3';

const PieChart = ({ results }) => {

  const margin = {
    top: 50, right: 50, bottom: 50,
  };

  //getting risk percentage (setting this up so user can check between diff timelines within tweet scraped)
  function reorganizeData(results) {
    var risk = 0;
    var noRisk = 0;

    var i;
    for (i = 0; i < results.length; i++) {
      if (results[i].risk == 0) {
        noRisk++;
      } else {
        risk++;
      }
    }
    risk = risk * 100 / results.length;
    noRisk = noRisk * 100 / results.length;

    return [{ label: "risk", value: risk.toFixed(2) }, { label: "no risk", value: noRisk.toFixed(2) }];
  }

  const data = reorganizeData(results);

  var outerRadius = 225;
  var innerRadius = 150;

  const width = 3 * outerRadius; 
  const height = 2.5 * outerRadius;
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  // legend dimensions
  var legendRectSize = 40; 
  var legendHorizontal = -320;
  var legendSpacing = 50;

 
  useEffect(() => {
    drawChart();
  }, [data]);

  function drawChart() {
    // Remove the old svg
    d3.select('#piechart')
      .select('svg')
      .remove();

    // Create new svg
    var svg = d3
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
      .attr('fill', function(d) { return colors(d.data.label); }); 
      //.style('fill', (_, i) => colors(i));

    // Append text labels
    arc
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text((d) => d.data.value)
      .style('fill', 'white')
      .attr('transform', (d) => {
        const [x, y] = arcGenerator.centroid(d);
        return `translate(${x}, ${y})`;
      });

    //legend
    var legend = svg.selectAll() 
      .data(colors.domain()) 
      .enter()
      .append('g') 
      .attr('class', 'legend') 
      .attr('transform', function (d, i) {
        var vert = i * legendSpacing; 
        return 'translate(' + legendHorizontal + ',' + vert + ')';     
      });

    // adding squares to legend
    legend.append('rect')                                   
      .attr('width', legendRectSize)                     
      .attr('height', legendRectSize)                      
      .style('fill', colors);

    // adding text to legend
    legend.append('text')
      .attr('x', legendRectSize + 10)
      .attr('y', legendRectSize - 10)
      .text(function (d) { return d; }); 

  }

  return (<div id="piechart" />);
}

export default PieChart;