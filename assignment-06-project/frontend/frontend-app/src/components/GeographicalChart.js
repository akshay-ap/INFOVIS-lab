import * as React from 'react';
import * as d3 from "d3";
import { useState, useEffect } from "react";
import worldMap from '../data/world.geo.json';
import { Typography } from '@mui/material';
import AppContext from './AppContext';
import { incomeGroupColors } from '../constants';

const GeographicalChart = () => {
    const [loaded, setLoaded] = useState(false);
    const { countries } = React.useContext(AppContext);
    console.log("countries", countries)
    const drawMap = () => {

        const width = 800, height = 500;

        const svg = d3.select('body').select('#geo-charts').select('#geo-map-container')
            .select("#my_dataviz").append("svg").attr("width", width)
            .attr("height", height);

        // Map and projection
        const projection = d3.geoNaturalEarth1()
            .scale(width / 1.3 / Math.PI)
            .translate([width / 2, height / 2])

        var Tooltip = d3.select("#geo-map-container").select('#my_dataviz')
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d) {
            Tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }
        var mousemove = function (event) {
            var coords = d3.pointer(event);
            var mouse = [coords[0], coords[1]];
            const found = countries.find(element => element['code'] === event.target.id.split('-')[2]);
            // console.log(mouse, event.target.id.split('-')[2])
            if (!found) return;
            Tooltip
                .html(`Country name: ${found.name}<br/>Income group: ${found.income_group}`)
                .style("left", (mouse[0]) + "px")
                .style("top", (mouse[1]) + "px")
        }
        var mouseleave = function (d) {
            Tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        svg.append("g")
            .selectAll("path")
            .data(worldMap.features)
            .join("path")
            .attr("fill", d => {
                const found = countries.find(element => element['code'] === d['id']);
                if (!found) {
                    console.log("Income group of country unknown:", d.properties['name'])
                    return "lightgrey"
                }
                return incomeGroupColors(found['income_group'])
            })
            .attr('id', d => {
                return `map-country-${d['id']}`
            })
            .attr("d", d3.geoPath()
                .projection(projection)
            ).style("stroke", "#fff").on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    }

    useEffect(() => {
        (async () => {
            if (loaded) return;
            if (countries.length === 0) return;
            // const svg = d3.select('body').select('#geo-charts').select('#geo-map-container').select("svg"),
            //     width = 800,
            //     height = 500;
            drawMap();
            setLoaded(true);
        })();

    }, [loaded, countries]);


    return (<div>
        <div style={{ marginLeft: '10px' }}>
            <Typography textAlign={"left"} variant='h4'>Countries by income group</Typography>
        </div>

        <div id="geo-map-container">
            <div id="my_dataviz" width="800" height="500"></div>
        </div>
    </div>)
}

export default GeographicalChart;