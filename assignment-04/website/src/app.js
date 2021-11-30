document.getElementById("name").innerText = "Akshay Patel";
document.getElementById("assignment_number").innerText = "4";
/////////////////////////////////////////////////////
import * as d3 from "d3";

const width = window.innerWidth; // full width
const height = window.innerHeight - 55; // full height - nav bar
const margin = { top: 20, bottom: 50, left: 50, right: 20 };

async function init() {
    // get data from flask-server
    const response = await fetch("http://127.0.0.1:8080/api/v1/get_data/sds011/12:00:00/12:05:00");
    const data = await response.json();

    // load map materials
    // europe.geojson is from https://github.com/leakyMirror/map-of-europe/tree/master/GeoJSON
    const europe = await d3.json("./data/europe.geojson") // contains all countries of europe
    const countries = europe.features.map(d => d.properties.ISO2);
    // capitals.geojson is from https://github.com/Stefie/geojson-world/blob/master/capitals.geojson
    let capitals = await d3.json("./data/capitals.geojson") // contains all captials of all countries
    // filter capitals which are in europe
    capitals.features = capitals.features.filter(d => countries.includes(d.properties.iso2) && d.properties.city != "Vatican City")

    console.log(data, europe, capitals)

    const map_container = d3.select("#map_container");

    const svg = map_container
        .append("svg")
        .attr("id", "map")
        .attr("width", width)
        .attr("height", height);

    const map_g = svg.append("g");
    const data_g = svg.append("g");

    const geo_projection = d3.geoMercator()
        .fitExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]],
            europe.features[14]) // the 14. entry is germany.
    const path = d3.geoPath(geo_projection);

    map_g.append("path").datum(europe).attr("d", path)
        .attr("id", "land")
        .attr("stroke-width", 0.5)
        .attr("stroke-linejoin", "round")

    const capitals_marker = map_g.selectAll("rect")
        .data(capitals.features)
        .enter()
        .append("rect")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 5)
        .attr("width", 10)
        .attr("height", 10)
        .attr("shape-rendering", "crispEdges")
        .attr("stroke", "black")
        .attr("fill", "none");

    const city_labels = map_g.selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0])
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 14)
        .attr("font-size", 16)
        .text(d => d.properties.city);

    const color = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(data, d => d.P2)]);

    data_g.selectAll("circle")
        .data(data.sort((a, b) => d3.ascending(a.P2, b.P2)))
        .enter()
        .append("circle")
        .attr("cx", d => geo_projection([d.lon, d.lat])[0])
        .attr("cy", d => geo_projection([d.lon, d.lat])[1])
        .attr("r", 2)
        .attr("opacity", 1)
        .attr("fill", d => color(d.P2));

    function zoomed({ transform }) {
        map_g.attr("transform", transform);
        map_g.select("path")
            .attr("stroke-width", 1 / transform.k);
        data_g.attr("transform", transform);
        data_g.selectAll("circle")
            .attr("r", 2 / transform.k);
        city_labels.attr("font-size", 16 / transform.k);
        capitals_marker.attr("stroke-width", 1 / transform.k);
    }

    const zoom = d3.zoom()
        .scaleExtent([0.25, 16])
        .on("zoom", zoomed);

    svg.call(zoom);

    const legend = map_container
        .append("div")
        .attr("id", "legend")

    legend.append("b").text("sds011: P2")
    const legend_svg = legend
        .append("svg")
        .attr("width", 320)
        .attr("height", 40);

    drawLegend(legend_svg, color);
}

// from https://observablehq.com/@d3/color-legend
function ramp(color, n = 256) {
    const canvas = document.createElement("canvas")
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
    }
    return canvas;
}

// from https://observablehq.com/@d3/color-legend
function drawLegend(svg, color, width = 320) {
    const n = Math.min(color.domain().length, color.range().length);
    const tickAdjust = g => g.selectAll(".tick line").attr("y1", -18);
    const x = color.copy().rangeRound(d3.quantize(d3.interpolate(0, width), n));
    // append color ramp
    svg.append("image")
        .attr("y", 0)
        .attr("x", 5)
        .attr("width", width - 10)
        .attr("height", 18)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());

    // append ticks
    svg.append("g")
        .attr("transform", `translate(0, ${18})`)
        .call(d3.axisBottom(x)
            .tickValues(x.ticks(5).slice(1)))
        .call(tickAdjust)
        .call(g => g.select(".domain").remove())
}

init();

