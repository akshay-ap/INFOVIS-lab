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
        const svg = d3.select('body').select('#geo-charts').select("svg"),
            width = 800,
            height = 500;
        // Map and projection
        const projection = d3.geoNaturalEarth1()
            .scale(width / 1.3 / Math.PI)
            .translate([width / 2, height / 2])

        svg.append("g")
            .selectAll("path")
            .data(worldMap.features)
            .join("path")
            .attr("fill", d => {
                console.log("d", d)
                const found = countries.find(element => element['code'] === d['id']);
                if (!found) {
                    console.log("Income group of country unknown:", d.properties['name'])
                    return "lightgrey"
                }
                return incomeGroupColors(found['income_group'])
            })
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
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
        <hr />
        <div style={{ marginLeft: '10px' }}>
            <Typography textAlign={"left"} variant='h4'>Indicators values by countries</Typography>
        </div>
        <div id="#geo-map-container">
            <svg id="my_dataviz" width="800" height="500"></svg>
        </div>
    </div>)
}

export default GeographicalChart;