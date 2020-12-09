import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import TweetTable from './TweetTableComponent';
import '../App.css';
// import { AreaChart, Area, Legend, CartesianGrid, XAxis, YAxis, Tooltip, Text } from 'recharts';


const PieChart = ({ results }) => {

    //cleaned up data 
    const [data, setResults] = useState([{ label: "no data", value: 100.00, array: [] }]);

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
    useEffect(() => {
        setData([]);
        setTable(false);
        setCurr("");
        setCount(0);
        if (results.length === 0) {
            setResults([{ label: "no data", value: 100.00, array: [] }]);
        }
        var riskTweets = [];
        var noRiskTweets = [];

        var i;
        for (i = 0; i < results.length; i++) {
            if (results[i].risk <= 0.5) { //checks risk assigned and divides given tweets into risk or not-risk groups
                noRiskTweets.push({ tweet: results[i].tweet, date: results[i].date, time: results[i].time, risk: results[i].risk.toFixed(2) });
            } else {
                riskTweets.push({ tweet: results[i].tweet, date: results[i].date, time: results[i].time, risk: results[i].risk.toFixed(2) });
            }
        }
        var risk = ((riskTweets.length * 100) / results.length).toFixed(2);
        var noRisk = ((noRiskTweets.length * 100) / results.length).toFixed(2);

        setResults([{ label: "at_risk", value: risk, array: riskTweets }, { label: "not_at_risk", value: noRisk, array: noRiskTweets }]);

    }, [results])

    //function to show details of arcs in pie chart 

    const [showTable, setTable] = useState(false);
    const [prevTable, setPrev] = useState("");
    const[sliceValue, setSlice] = useState("");
    var [currTable, setCurr] = useState("");
    const [tableData, setData] = useState([]);
    var [counter, setCount] = useState(0);

    //notifies states that the user has clicked the pie chart 
    function change(d, i) {
        setCount(counter++);
        setSlice("" + i.dataset.value);
        setTable(currTable !== i.id);
        setCurr(i.id + " " + counter);
    };

    function arcColor(label){
        if(label == "at_risk"){
            return "#779ecb"
        }
        else{
            return "#f6ed95"
        }
    };

    //creates movement in pie chart based on what area the user clicked 
    useEffect(() => {
        if (results.length !== 0 && data.length !== 0) {
            var current = currTable.split(" ");
            var prev = prevTable.split(" ");
            var res = (sliceValue).split(",");
            var text;

                var startAngle = parseFloat(res[0]);
                var endAngle = parseFloat(res[1]);
                var angle = 270 - ((startAngle * (180 / Math.PI)) + ((endAngle - startAngle) * (180 / Math.PI) / 2));

            if (current[0] !==  prev[0]) {
                
                if (res[2] === "at_risk") {
                    setData(data[0].array);
                    text = "% at-risk tweets: " + res[3];

                } else {
                    setData(data[1].array);
                    text = "% low-risk tweets: " + res[3];
                }
 
                d3.select("text.center")
                    .text(text)
                    .style("font-size", 20)
                    .style("fill", "#5a56bf")
                    .attr("transform", "rotate(" + (360 - angle) + ")");

                d3.select("g.chart")
                    .transition()
                    .duration(1000)
                    .attr("transform", "translate(" + (size * 1.2) + " " + (size / 2.3) + ")");

                d3.selectAll("path.arc")
                    .transition()
                    .duration(1000)
                    .style("fill", "#ccc")
                    .attr("d", createArc)

                d3.select("#" + res[2])
                    .transition()
                    .duration(1000)
                    .style("fill", (d) => arcColor(d.data.label))
                    .attr("d", arcOver)

                d3.select("g.square")
                    .transition()
                    .duration(1000)
                    .attr("transform", "rotate(" + angle + ")");
               setPrev(currTable);
      
            } else {
                setData([]);

                d3.select("text.center")
                    .text("click an arc to learn more")
                    .style("font-size", 15)
                    .style("fill", "gray")
                    .attr("transform", "rotate(" + (0) + ")");

                d3.select("g.chart")
                    .transition()
                    .duration(1000)
                    .attr("transform", "translate(" + (size / 1.2) + " " + (size / 3) + ")");
                
                d3.selectAll("path.arc")
                    .style("fill", (d) => arcColor(d.data.label));
                
                d3.select("#" + res[2])
                    .transition()
                    .duration(1000)
                    .style("fill", (d) => arcColor(d.data.label))
                    .attr("d", createArc);

                d3.select("g.square")
                    .transition()
                    .duration(1000)
                    .attr("transform", "rotate(" + (0) + ")");

                setPrev("");

            }
           
        }
    }, [showTable, currTable])

    //creates actual chart 
    useEffect(() => {
        setData([]);
        setCount(0);
        setCurr("");
        const pie = createPie(data);
        const prevData = createPie(cache.current);
        const square = d3.select("g.square");
        const groupWithData = square.selectAll("g.arc").data(pie);
        d3.selectAll("text.center").remove();
        groupWithData.exit().remove();

        d3.select("g.square")
            .transition()
            .duration(1000)
            .attr("transform", "rotate(" + (0) + ")");
        
            d3.select("g.chart")
                    .transition()
                    .duration(1000)
                    .attr("transform", "translate(" + (size / 1.2) + " " + (size / 3) + ")");


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

        function arcColor(label){
            if(label == "at_risk"){
                return "#779ecb"
            }
            else{
                return "#f6ed95"
            }
        };

        path
            .transition().duration(1000)
            .attr("class", "arc")
            .attr("id", (d) => d.data.label)
            .attr("data-value", (d) => [d.startAngle, d.endAngle, d.data.label, d.data.value])
            .style("fill", (d) => arcColor(d.data.label))
            .attrTween("d", arcTween)
     
        const center = d3.select("g.square")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("class", "center")

        if (results.length === 0) {
            center
                .style("fill", "gray")
                .style("font-size", 18)
                .text("no data available");
        } else {
            center
                .style("fill", "gray")
                .style("font-size", 15)
                .text("click an arc to learn more");
        }
        cache.current = data;
    }, [data]);

    const columns = [
        {id: 'date', label:"Date", minWidth: 50},
        {id: 'time', label: "Time",  minWidth: 30},
        {id: 'tweet', label: "Tweet",minWidth: 170, },
        {id: 'risk', label: "Risk", minWidth: 10,}
    ]

    return (<div className="visualization" >
        <div className={tableData.length !== 0 ? "fadeIn" : "fadeOut"} >
            <TweetTable data={tableData}
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