import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Table from './TableComponent';
import '../App.css';


const PieChart = ({ results}) => {

    function reorganizeData(results) {
        if (results.length == 0) {
            return [{ label: "no data", value: 100.00, array: []}];
        }
        var risk = 0;
        var riskTweets = [];
        var noRisk = 0;
        var noRiskTweets = [];

        var i;
        for (i = 0; i < results.length; i++) {
            if (results[i].risk == 0) {
                noRisk++;
                noRiskTweets.push({tweet: results[i].tweet, time: results[i].time});
            } else {
                risk++;
                riskTweets.push({tweet: results[i].tweet, time: results[i].time});
            }
        }
        risk = risk * 100 / results.length;
        noRisk = noRisk * 100 / results.length;

        return [{ label: "risk", value: risk.toFixed(2), array: riskTweets }, { label: "no risk", value: noRisk.toFixed(2), array: noRiskTweets }];
    }

    var click = false;
    var data = reorganizeData(results);

    var outerRadius = 225;
    var innerRadius = 150;

    const width = 3 * outerRadius;
    const height = 3 * outerRadius;
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    // legend dimensions
    var legendRectSize = 10;
    var legendHorizontal = -325;
    var legendSpacing = 50;

    const ref = useRef(null);
    const cache = useRef(data);
    const createPie = d3
        .pie()
        .value((d) => d.value)
        .sort(null);
    const createArc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var arcOver = d3.arc()
    .outerRadius(outerRadius + 10)
    .innerRadius(innerRadius);



    const format = d3.format(".2f");

    function change(d, i) {
        click = true;
        console.log(click === true);
        console.log(click);
        var res = (i.id).split(",");
        console.log(res)
        var startAngle = parseFloat(res[0]);
        var endAngle = parseFloat(res[1]);
        var angle = 90 - ((startAngle * (180 / Math.PI)) + ((endAngle - startAngle) * (180 / Math.PI) / 2))
        d3.select("g.square")
            .transition()
            .duration(1000)
            .attr("transform", "rotate(" + angle + ")")

        d3.selectAll("path")
          .transition()
          .attr("d", createArc)
          
        d3.select(i)
          .transition()
          .duration(1000)
          .attr("d", arcOver)
      };
      

    function createChart(){
        const pie = createPie(data);
        const prevData = createPie(cache.current);
        const group = d3.select(ref.current);
        const square = d3.select("g.square");
        //const square = d3.select("g.hi").append("g").attr("class", "square");
        const groupWithData = square.selectAll("g.arc").data(pie);
        const legendWithData = group.selectAll("g.legend").remove();
     
        groupWithData.exit().remove();
        group.selectAll("g.legend").exit().remove();

        const groupWithUpdate = groupWithData
            .enter()
            .append("g")
            .attr("class", "arc");

        const path = groupWithUpdate
            .append("path")
            .merge(groupWithData.select("path.arc"))
            .on("click", function(d) {
                change(d, this);


                // _('.text-container').hide();
                // _('#segmentTitle').replaceWith('<h1 id="segmentTitle">' + d.data.risk + '</h1>');
                // _('#')
                // _('#segmentText').replaceWith('<p id="segmentText">' + d.data.label + '</p>');
                // _('.text-container').fadeIn(400);
              });

        const arcTween = (d, i) => {
            const interpolator = d3.interpolate(prevData[i], d);
            return (t) => createArc(interpolator(t));
        };

        path
            .transition().duration(1000)
            .attr("class", "arc")
            .attr("id", (d) => [d.startAngle, d.endAngle])
            .attr("value", (d) => d.startAngle)
            .attr("fill", (d) => colors(d.data.label))
            .attrTween("d", arcTween)
            
        
        const text = groupWithUpdate
            .append("text")
            .merge(groupWithData.select("text"));

        text
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("fill", "white")
            .style("font-size", 15)
            .transition()
            .attr("transform", (d) => `translate(${createArc.centroid(d)})`)
            .tween("text", (d, i, nodes) => {
                const interpolator = d3.interpolate(prevData[i], d);
                return (t) => d3.select(nodes[i]).text(format(interpolator(t).value));
            });

        cache.current = data;

         //legend
            var legend = group.selectAll() 
            .data(colors.domain()) 
            .enter()
            .append('g') 
            .attr('class', 'legend') 
            .attr('transform', function (d, i) {
            var vert = i * legendSpacing; 
            return 'translate(' + legendHorizontal + ',' + vert + ')';     
            });

        // adding squares to legend
        legend.append('circle')                                   
            .attr('cx', legendRectSize)                     
            .attr('cy', legendRectSize)
            .attr("r",15)                      
            .style('fill', colors);

        // adding text to legend
        legend.append('text')
        .style("font-size", 15)
            .attr('x', legendRectSize + 25)
            .attr('y', legendRectSize + 5)
            .text(function (d) { return d; }); 
    }

    useEffect(() => {
        createChart();
    }, [data]);

    const columns = [{
        Header: "Tweet Assessment Breakdown",
        columns: [
          {
            Header: "Time",
            accessor: "time"
          },
          {
            Header: "Tweet",
            accessor: "tweet",
            style: { 'whiteSpace': 'unset' }
          }
          ]
      }];

    return (
        <div className = "visualization"> 
            <svg width={width} height={height}>
                <g class = "hi" ref={ref} transform={`translate(${outerRadius + 150} ${outerRadius + 50})`}  >
                    <g class = "square"/>
                
                    </g>
            </svg>
            
            {click === true ? <Table data = {data[0].array} columns = {columns} /> : null}
            {/* <div id = "table"> 
                <Table data = {data[0].array} columns = {columns} />
                </div> */}
        </div>
    );
};

export default PieChart;