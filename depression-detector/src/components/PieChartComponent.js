import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PieChart = ({ results }) => {

    function reorganizeData(results) {
        if (results.length == 0) {
            return [{ label: "no data", value: 100.00}];
        }
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

    var data = reorganizeData(results);

    var outerRadius = 225;
    var innerRadius = 150;

    const width = 3 * outerRadius;
    const height = 2.5 * outerRadius;
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
    const format = d3.format(".2f");

    function createChart(){
        const pie = createPie(data);
        const prevData = createPie(cache.current);
        const group = d3.select(ref.current);
        const groupWithData = group.selectAll("g.arc").data(pie);
        const legendWithData = group.selectAll("g.legend").remove();

        groupWithData.exit().remove();
        group.selectAll("g.legend").exit().remove();


        const groupWithUpdate = groupWithData
            .enter()
            .append("g")
            .attr("class", "arc");

        const path = groupWithUpdate
            .append("path")
            .merge(groupWithData.select("path.arc"));

        const arcTween = (d, i) => {
            const interpolator = d3.interpolate(prevData[i], d);
            return (t) => createArc(interpolator(t));
        };

        path
            .transition().duration(1000)
            .attr("class", "arc")
            .attr("fill", (d) => colors(d.data.label))
            .attrTween("d", arcTween);

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

    return (
        <svg width={width} height={height}>
            <g
                ref={ref}
                transform={`translate(${outerRadius + 150} ${outerRadius})`}
            />
        </svg>
    );
};

export default PieChart;