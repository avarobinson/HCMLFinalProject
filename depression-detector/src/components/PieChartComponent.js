import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Table from './TableComponent';
import '../App.css';


const PieChart = ({ results }) => {

    //cleaned up data 
    var data = reorganizeData(results);

    //pie chart variables 
    var outerRadius = 225;
    var innerRadius = 150;

    const width = 3.5 * outerRadius;
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

    const arcOver = d3.arc()
        .outerRadius(outerRadius + 50)
        .innerRadius(innerRadius);

    const format = d3.format(".2f");


    //cleans up data given for the pie chart and table to process 
    function reorganizeData(results) {
        if (results.length === 0) {
            return [{ label: "no data", value: 100.00, array: [] }];
        }
        var riskTweets = [];
        var noRiskTweets = [];

        var i;
        for (i = 0; i < results.length; i++) {
            if (results[i].risk === 0) { //checks risk assigned and divides given tweets into risk or not-risk groups
                noRiskTweets.push({ tweet: results[i].tweet, time: results[i].time });
            } else {
                riskTweets.push({ tweet: results[i].tweet, time: results[i].time });
            }
        }
        var risk = (riskTweets.length * 100) / results.length;
        var noRisk = (noRiskTweets.length * 100) / results.length;

        return [{ label: "risk", value: risk.toFixed(2), array: riskTweets }, { label: "no risk", value: noRisk.toFixed(2), array: noRiskTweets }];
    }

    //function to show details of arcs in pie chart 

    const [showTable, setTable] = useState(false);
    const [prevTable, setChange] = useState("");
    const [tableData, setData] = useState([]);

    function change(d, i) {
        var res = (i.id).split(",");
        var startAngle = parseFloat(res[0]);
        var endAngle = parseFloat(res[1]);
        var angle = 90 - ((startAngle * (180 / Math.PI)) + ((endAngle - startAngle) * (180 / Math.PI) / 2))

        if (prevTable !== res[2]) {
            if (res[2] === "risk") {
                setData(data[0].array);
            } else {
                setData(data[1].array);
            }
            setChange(res[2]);
            setTable(true);

            d3.select("g.chart")
            .transition()
            .duration(1000)
            .attr("transform", "translate(" + (outerRadius + 200) + " " + (outerRadius + 50) + ")");

            d3.select(i)
                .transition()
                .duration(1000)
                .attr("d", arcOver);

            d3.select("g.square")
                .transition()
                .duration(1000)
                .attr("transform", "rotate(" + angle + ")");


        } else {
            setTable(false);
            setData([]);
            setChange("");

            d3.select("g.chart")
            .transition()
            .duration(1000)
            .attr("transform", "translate(" + (outerRadius + 325) + " " + (outerRadius + 50) + ")");

            d3.select(i)
                .transition()
                .duration(1000)
                .attr("d", createArc);

            d3.select("g.square")
                .transition()
                .duration(1000)
                .attr("transform", "rotate(" + (0) + ")");

        }



    };

    //creates actual chart 
    useEffect(() => {

        const pie = createPie(data);
        const prevData = createPie(cache.current);
        const group = d3.select(ref.current);
        const square = d3.select("g.square");
        const groupWithData = square.selectAll("g.arc").data(pie);

        groupWithData.exit().remove();
        d3.selectAll("g.legend").remove();

        const groupWithUpdate = groupWithData
            .enter()
            .append("g")
            .attr("class", "arc");

        const path = groupWithUpdate
            .append("path")
            .merge(groupWithData.select("path.arc"))
            .on("click", function (d) {
                if (results.length !== 0) {
                    change(d, this);
                }
            });

        const arcTween = (d, i) => {
            const interpolator = d3.interpolate(prevData[i], d);
            return (t) => createArc(interpolator(t));
        };

        path
            .transition().duration(1000)
            .attr("class", "arc")
            .attr("id", (d) => [d.startAngle, d.endAngle, d.data.label])
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
            .attr("r", 15)
            .style('fill', colors);

        // adding text to legend
        legend.append('text')
            .style("font-size", 15)
            .attr('x', legendRectSize + 25)
            .attr('y', legendRectSize + 5)
            .text(function (d) { return d; });
    });

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
        <div className="visualization">
            <svg width={width} height={height}>
                <g className = "chart" ref={ref} transform={`translate(${outerRadius + 325} ${outerRadius + 50})`}  >
                    <g className="square" />
                </g>
            </svg>
            <div className = {showTable ? "fadeIn" : "fadeOut"}> 
                <Table data={tableData} columns={columns} /> 
            </div>
        </div>
    );
};

export default PieChart;