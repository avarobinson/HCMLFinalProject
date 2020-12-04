import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Table from './TableComponent';
import '../App.css';


const PieChart = ({ results }) => {

    //cleaned up data 
    var data = reorganizeData(results);

    //pie chart variables 
    var outerRadius = 200;
    var innerRadius = 150;

    const size = 3 * outerRadius;

    const ref = useRef(null);
    const cache = useRef(data);

    const createPie = d3
        .pie()
        .value((d) => d.value)
        .sort(null)
        .padAngle(.02);;

    const createArc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const arcOver = d3.arc()
        .outerRadius(outerRadius + 50)
        .innerRadius(innerRadius);


    //cleans up data given for the pie chart and table to process 
    function reorganizeData(results) {
        if (results.length === 0) {
            return [{ label: "no data", value: 100.00, array: [] }];
        }
        var riskTweets = [];
        var noRiskTweets = [];
        var riskPercent = 0;
        var noRiskPercent = 0;

        var i;
        for (i = 0; i < results.length; i++) {
            if (results[i].risk <= 0.5) { //checks risk assigned and divides given tweets into risk or not-risk groups
                noRiskTweets.push({ tweet: results[i].tweet, date: results[i].date, time: results[i].time, risk: results[i].risk });
                noRiskPercent += results[i].risk;
            } else {
                riskTweets.push({ tweet: results[i].tweet, date: results[i].date, time: results[i].time, risk: results[i].risk});
                riskPercent += results[i].risk;
            }
        }
        var risk = ((riskPercent * 100) / results.length).toFixed(2);
        var noRisk = ((riskPercent * 100) / results.length).toFixed(2);

        return [{ label: "risk", value: risk, array: riskTweets }, { label: "no risk", value: noRisk, array: noRiskTweets }];
    }

    //function to show details of arcs in pie chart 

    const [showTable, setTable] = useState(false);
    const [prevTable, setChange] = useState("");
    const [tableData, setData] = useState([]);

    useEffect(() => {
        setTable(false);
        setData([]);
        setChange("");

        d3.select("g.chart")
            .transition()
            .duration(1000)
            .attr("transform", "translate(" + (size /1.2 ) + " " + (size / 3) + ")");

        d3.select("g.square")
            .transition()
            .duration(1000)
            .attr("transform", "rotate(" + (0) + ")");
        
    }, [results])

    function change(d, i) {
        var res = (i.id).split(",");
        var startAngle = parseFloat(res[0]);
        var endAngle = parseFloat(res[1]);
        var angle = 270 - ((startAngle * (180 / Math.PI)) + ((endAngle - startAngle) * (180 / Math.PI) / 2))

        if (prevTable !== res[2]) {
            if (res[2] === "risk") {
                setData(data[0].array);

            } else {
                setData(data[1].array);

            }
            setChange(res[2]);
            setTable(true);
            d3.select("text.center")
                .text(res[2] + ": " + res[3] + "%")
                .style("font-size", 30)
                .style("fill", "#5a56bf")
                .attr("transform", "rotate(" + (360 - angle) + ")");

            d3.select("g.chart")
                .transition()
                .duration(1000)
                .attr("transform", "translate(" + (size * 1.2) + " " + (size / 2.3) + ")");

            d3.select(i)
                .transition()
                .duration(1000)
                .attr("fill", "#5a56bf")
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
                .attr("transform", "translate(" + (size /1.2 ) + " " + (size / 3) + ")");
                

            d3.select(i)
                .transition()
                .duration(1000)
                .attr("fill", "#8884D7")
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
        const square = d3.select("g.square");
        const groupWithData = square.selectAll("g.arc").data(pie);
        d3.selectAll("text.center").remove();
        groupWithData.exit().remove();

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
            .attr("id", (d) => [d.startAngle, d.endAngle, d.data.label, d.data.value])
            .attr("value", (d) => d.startAngle)
            .attr("fill", "#8884d8")
            .attrTween("d", arcTween)

            const center = d3.select("g.square")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("class", "center")
             
        if(results.length === 0){ 
            center
            .style("fill", "gray")
            .style("font-size", 18)
            .text("no data available");
        }else{
            center
            .style("fill", "gray")
            .style("font-size", 18)
            .text("click an arc to learn more");
        }

        cache.current = data;
    });

    const columns = [{
        Header: "Tweet Assessment Breakdown",
        columns: [{
            Header: "Date",
            accessor: "date"
        },
        {
            Header: "Time",
            accessor: "time"
        },
        {
            Header: "Tweet",
            accessor: "tweet",
            style: { 'whiteSpace': 'unset' }
        },
        {
            Header: "Risk",
            accessor: "risk"
        }
        ]
    }];

    return (<div className="visualization" >
        <div className={showTable ? "fadeIn" : "fadeOut"} >
            <Table data={tableData}
                columns={columns} />
        </div>
        <div className="test">
            <svg width={1000}
                height={size}  >
                <g className="chart" ref={ref} transform={`translate(${size / 1.2} ${size / 3})`} >
                    <g className="square" />
                </g>
            </svg>
        </div>

    </div>
    );
};

export default PieChart;