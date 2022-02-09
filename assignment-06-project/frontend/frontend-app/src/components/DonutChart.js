import React, { useEffect } from "react";
import * as d3 from "d3";
import { incomeGroups, incomeGroupColors } from '../constants';
import AppContext from './AppContext';

const DonutChart = () => {

    const { countries } = React.useContext(AppContext);

    const drawChart = () => {

        d3.select('body').select("#donut-chart").selectAll('*').remove();
        // set the dimensions and margins of the graph
        const width = 900,
            height = 450,
            margin = 40;

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        const radius = Math.min(width, height) / 2 - margin

        // append the svg object to the div called 'my_dataviz'
        const svg = d3.select('body').select("#donut-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);
        // const incomeGroups = ["Low income", "Lower middle income", "Upper middle income", "High income"];

        // Create dummy data


        const data = { "Low income": 0, "Lower middle income": 0, "Upper middle income": 0, "High income": 0 }

        for (var i = 0; i < countries.length; i++) {
            if (!data[countries[i]['income_group']]) {
                data[countries[i]['income_group']] = 0;
            }

            data[countries[i]['income_group']]++;
        }

        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .sort(null) // Do not sort group by size
            .value(d => d[1])
        const data_ready = pie(Object.entries(data))

        // The arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.5)         // This is the size of the donut hole
            .outerRadius(radius * 0.8)

        // Another arc that won't be drawn. Just for labels positioning
        const outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
            .selectAll('allSlices')
            .data(data_ready)
            .join('path').transition()
            .attr('d', arc)
            .attr('fill', d => incomeGroupColors(d.data[0]))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7).duration(2000)

        // Add the polylines between chart and labels:
        svg
            .selectAll('allPolylines')
            .data(data_ready)
            .join('polyline')
            .attr("stroke", "black")
            .transition()
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function (d) {
                const posA = arc.centroid(d) // line insertion in the slice
                const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                const posC = outerArc.centroid(d); // Label position = almost the same as posB
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            }).duration(2000)

        // Add the polylines between chart and labels:
        svg
            .selectAll('allLabels')
            .data(data_ready)
            .join('text')
            .text(d => `${d.data[0]} (${d.data[1]} countries)`)
            .attr('transform', function (d) {
                const pos = outerArc.centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .style('text-anchor', function (d) {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })
    }

    useEffect(() => {
        if (countries.length >= 1) {
            drawChart();
        }
    }, [countries])

    return (<div id="donut-chart"></div>)
}

export default DonutChart