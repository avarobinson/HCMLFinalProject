import React, { useEffect, useRef } from "react";
import * as d3 from "d3";


const PieChart = props => {
  var width = 500;
  var height = 500;
  var outerRadius = Math.min(width, height) / 2;
  var innerRadius = outerRadius * .50; 

  function reorganizeData (data){
    var risk = 0;
    var noRisk = 0;

    var i;
    for(i = 0; i < data.length; i++){
      if(data[i].risk == 0){
        noRisk++;
      }else{
        risk++;
      }
    }
    risk = risk*100/data.length;
    noRisk = noRisk*100/data.length;
    
    return [{ label: "risk", percent: risk}, {label: "noRisk", percent: noRisk}];
  }

  const percentage = reorganizeData(props.data);
    
  const ref = useRef(null);
  const cache = useRef(percentage);

  const createPie = d3
    .pie()
    .value(d => d.percent)
    .sort(null);

  const createArc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
  const colors = d3.scaleOrdinal(d3.schemeCategory10);
  const format = d3.format(".2f");

  useEffect(
    () => {
      const data = createPie(percentage);
      const prevData = createPie(cache.current);
      const group = d3.select(ref.current);
      const groupWithData = group.selectAll("g.arc").data(data);

      groupWithData.exit().remove();

      const groupWithUpdate = groupWithData
        .enter()
        .append("g")
        .attr("class", "arc");

      const path = groupWithUpdate
        .append("path")
        .merge(groupWithData.select("path.arc"));

      const arcTween = (d, i) => {
        const interpolator = d3.interpolate(prevData[i], d);

        return t => createArc(interpolator(t));
      };

      path
        .attr("class", "arc")
        .attr("fill", (d, i) => colors(i))
        .transition()
        .attrTween("d", arcTween);

      const text = groupWithUpdate
        .append("text")
        .merge(groupWithData.select("text"));

      text
        .style("font-size", 20)
        .transition()
        .attr("transform", d => `translate(${createArc.centroid(d)})`)
        .tween("text", (d, i, nodes) => {
          const interpolator = d3.interpolate(prevData[i], d);

          return t => d3.select(nodes[i]).text(format(interpolator(t).value));
        });

      cache.current = percentage;
    },
    [percentage]
  );

  return (
    <div>
      <svg width={width} height={height}>
        <g
          ref={ref}
          transform={`translate(${outerRadius} ${outerRadius})`}
        />
      </svg>
    </div>
  );
};

export default PieChart;
