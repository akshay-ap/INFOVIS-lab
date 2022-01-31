import * as React from 'react';
import * as d3 from "d3";
import { useState, useEffect } from "react";

const GeographicalChart = () => {

    const loadMap = async () => {
        const worldGeoJson = await d3.json("../data/world.geo.json") // contains all countries of world
        console.log(worldGeoJson)
        return worldGeoJson;
    }

    useEffect(() => {
        (async () => {
            const map = await loadMap();
            //         }
        })();

    }, []);


    return <div>geo chart</div>
}

export default GeographicalChart;