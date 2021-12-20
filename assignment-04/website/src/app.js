document.getElementById("name").innerText = "Akshay Patel";
document.getElementById("assignment_number").innerText = "4";
/////////////////////////////////////////////////////
import * as d3 from "d3";

const width = window.innerWidth * 0.50; // full width
const height = window.innerHeight * 0.90; // full height - nav bar
const margin = { top: 20, bottom: 50, left: 50, right: 20 };

var particulateData = [];
var particulateType = "P1";
var interval;

var glyphData = [];

var humidityData = [];

const get_particulate_data = async (type, start, end) => {
    const response = await fetch(`http://127.0.0.1:8080/api/v1/get-particulate-data?type=${type}&start=${start}&end=${end}`);
    const data = await response.json();
    console.log("Particulate data", start, end, data);
    return data;
}


const get_noise_data = async (start, end) => {
    const response = await fetch(`http://127.0.0.1:8080/api/v1/get-noise-data?start=${start}&end=${end}`);
    const data = await response.json();
    console.log("Noise data", start, end, data);
    return data;
}

const get_humidity_data = async (start, end) => {
    const response = await fetch(`http://127.0.0.1:8080/api/v1/get-humidity-data?start=${start}&end=${end}`);
    const data = await response.json();
    console.log("Humidity data", start, end, data);
    return data;
}

const color = d3.scaleSequential(d3.interpolate("lightgreen", "red"))
    .domain([0, 450]);

async function addColorToCountries(type, startTime, endTime) {
    particulateData = await get_particulate_data(type, startTime, endTime);
    d3.select("main").select("#map-particulate-container").select("#start-time").text(startTime);
    d3.select("main").select("#map-particulate-container").select("#end-time").text(endTime);
    particulateData.forEach((e) => {
        const x = d3.select("#map_container").select(`#land-${e.cc}`);
        x.transition().attr('fill', () => { return color(e.P_AVG) }).attr("opacity", 1).duration(1000);
    })
}

async function addHumidityData(startTime, endTime) {
    humidityData = await get_humidity_data(startTime, endTime);
    d3.select("main").select("#map-humidity-container").select("#start-time").text(startTime);
    d3.select("main").select("#map-humidity-container").select("#end-time").text(endTime);

    humidityData.forEach((e) => {

        if (e.HUMIDITY_AVG > 100 || e.HUMIDITY_AVG < 0) {
            console.log("Invalid HUMIDITY_AVG", e)
            return
        }

        const x = d3.select("main").select("#map-humidity-container").select("#map-humidity").select(`#rect-land-${e.cc}`);
        x.transition().attr('r', e.HUMIDITY_AVG * 0.5).attr("opacity", 0.25)
            .style("stroke", "#00b4d8")
            .style("stroke-width", 3).duration(1000);

        d3.select("main").select("#map-humidity-container").select("#map-humidity").select(`#text-humidity-${e.cc}`)
            .text(Math.round(e.HUMIDITY_AVG) + " %");
    })
}


async function addGlyphData(startTime, endTime) {
    glyphData = await get_noise_data(startTime, endTime);
    d3.select("main").select("#map-glyph-container").select("#start-time").text(startTime);
    d3.select("main").select("#map-glyph-container").select("#end-time").text(endTime);
    // d3.select("#map-glyph-container").selectAll(`[id*="text-glyph-"]`).transition().text('-').duration(1000);
    d3.select("#map-glyph-container").selectAll(`[id='land-*']`).attr('fill', 'black');

    glyphData.forEach((e) => {

        d3.select("main").select("#map-glyph-container").select(`#text-noise-max-${e.cc}`)
            .transition()
            .text(Math.round(e.noise_LA_max) + " db").duration(1000);

        d3.select("main").select("#map-glyph-container").select(`#rect-noise-max-${e.cc}`)
            .transition()
            .attr("width", e.noise_LA_max * 0.25).duration(1000);

        d3.select("main").select("#map-glyph-container").select(`#text-noise-min-${e.cc}`)
            .transition()
            .text(Math.round(e.noise_LA_min) + " db").duration(1000);

        d3.select("main").select("#map-glyph-container").select(`#rect-noise-min-${e.cc}`)
            .transition()
            .attr("width", e.noise_LA_min * 0.25).duration(1000);

        d3.select("main").select("#map-glyph-container").select(`#text-noise-avg-${e.cc}`)
            .text(Math.round(e.noise_LAeq) + " db");

        d3.select("main").select("#map-glyph-container").select(`#rect-noise-avg-${e.cc}`)
            .transition()
            .attr("width", e.noise_LAeq * 0.25).duration(1000);

        d3.select("#map-glyph-container").select(`#land-${e.cc}`).transition().attr('fill', '#8FDDE7')
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round").attr("stroke-color", "black")
            .attr("opacity", 0.75).duration(1000);
    })
}

async function initParticulateMap(type) {
    var counter = 0;
    var startTime = `${String(counter).padStart(2, '0')}:00:00`;
    var endTime = `${String(counter + 1).padStart(2, '0')}:00:00`;
    // Clear previous svg
    d3.select("#map_container").selectAll("svg").remove();
    d3.select("main").select("#map-particulate-container").select("#particulate-type").text(`Type: ${type}`);

    // get data from flask-server

    // load map materials
    // europe.geojson is from https://github.com/leakyMirror/map-of-europe/tree/master/GeoJSON
    const europe = await d3.json("./data/europe.geojson") // contains all countries of europe
    const countries = europe.features.map(d => d.properties.ISO2);
    // capitals.geojson is from https://github.com/Stefie/geojson-world/blob/master/capitals.geojson
    let capitals = await d3.json("./data/capitals.geojson") // contains all captials of all countries
    // filter capitals which are in europe
    capitals.features = capitals.features.filter(d => countries.includes(d.properties.iso2) && d.properties.city != "Vatican City")
    const map_container = d3.select("#map_container");

    const svg = map_container
        .append("svg")
        .attr("id", "map-particulate")
        .attr("width", width)
        .attr("height", height);

    const map_g = svg.append("g");
    const data_g = svg.append("g");

    const geo_projection = d3.geoMercator().scale(700).center([15, 65])
    const path = d3.geoPath(geo_projection);

    map_g.selectAll("path").data(europe.features).join("path")
        .attr("d", path)
        // set the color of each country
        .attr("fill", function (d) {
            return "gray";
        })
        .attr("id", (d) => { return "land-" + d.properties["ISO2"]; })
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round").attr("stroke-color", "black");

    const country_markers = map_g.selectAll("rect")
        .data(capitals.features)
        .enter()
        .append("rect")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 5)
        .attr("width", 2)
        .attr("height", 2)
        .attr("shape-rendering", "crispEdges")
        .attr("fill", "black");

    // https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
    var Tooltip = d3.select("#map_container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    var mousemove = function (event) {
        const countryCode = event.target.id.split('-').pop()
        const hoveredCountry = particulateData.find(e => e.cc === countryCode)
        var text = "No data found";
        if (hoveredCountry) text = `Country:${event.target.textContent}<br/>Average ${type}: ${Math.round(hoveredCountry.P_AVG)}`
        var coords = d3.pointer(event);
        var mouse = [coords[0], coords[1]];
        Tooltip
            .html(text)
            .style("left", (mouse[0]) + "px")
            .style("top", (mouse[1] + 20) + "px")
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    const country_labels = map_g.selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr('id', d => { return `text-land-${d.properties['iso2']}` })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0])
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 14)
        .attr("font-size", 16)
        .text(d => d.properties.country)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // const response = await fetch("http://127.0.0.1:8080/api/v1/get_data/sds011/12:00:00/12:05:00");
    // const data = await response.json();

    function zoomed({ transform }) {
        map_g.attr("transform", transform);
        map_g.select("path")
            .attr("stroke-width", 1 / transform.k);
        data_g.attr("transform", transform);
        data_g.selectAll("circle")
            .attr("r", 2 / transform.k);
        country_labels.attr("font-size", 16 / transform.k);
        country_markers.attr("stroke-width", 1 / transform.k);
    }

    const zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on("zoom", zoomed);

    svg.call(zoom);

    const legend = map_container
        .append("div")
        .attr("id", "legend")

    legend.append("b").text(`sds011: ${type}`)
    const legend_svg = legend
        .append("svg")
        .attr("width", 500)
        .attr("height", 40);

    drawLegend(legend_svg, color);
    await addColorToCountries(type, startTime, endTime);

    interval = setInterval(async function () {
        counter++;
        if (counter == 24) counter = 0;
        startTime = `${String(counter).padStart(2, '0')}:00:00`;
        endTime = `${String(counter + 1).padStart(2, '0')}:00:00`;
        await addColorToCountries(type, startTime, endTime);
    }, 5000);

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
function drawLegend(svg, color, width = 500) {
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

async function initGlyphMap() {
    var counter = 0;
    var startTime = `${String(counter).padStart(2, '0')}:00:00`;
    var endTime = `${String(counter + 1).padStart(2, '0')}:00:00`;
    // Clear previous svg
    d3.select("#glyph-container").selectAll("svg").remove();

    // get data from flask-server

    // load map materials
    // europe.geojson is from https://github.com/leakyMirror/map-of-europe/tree/master/GeoJSON
    const europe = await d3.json("./data/europe.geojson") // contains all countries of europe
    const countries = europe.features.map(d => d.properties.ISO2);
    // capitals.geojson is from https://github.com/Stefie/geojson-world/blob/master/capitals.geojson
    let capitals = await d3.json("./data/capitals.geojson") // contains all captials of all countries
    // filter capitals which are in europe
    capitals.features = capitals.features.filter(d => countries.includes(d.properties.iso2) && d.properties.city != "Vatican City")
    const map_container = d3.select("#glyph-container");

    const svg = map_container
        .append("svg")
        .attr("id", "map-glyph")
        .attr("width", width)
        .attr("height", height);

    const map_g = svg.append("g");
    const data_g = svg.append("g");

    const geo_projection = d3.geoMercator().scale(700).center([15, 65])
    const path = d3.geoPath(geo_projection);

    map_g.selectAll("path").data(europe.features).join("path")
        .attr("d", path)
        // set the color of each country
        .attr("fill", function (d) {
            return "lightgray";
        })
        .attr("id", (d) => { return "land-" + d.properties["ISO2"]; })
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round").attr("stroke-color", "black");

    const text_noise_min = map_g.append("g").selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr("id", d => { return "text-noise-min-" + d.properties["iso2"] })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] + 2)
        .attr("font-size", 4)

    const rect_noise_min = map_g.selectAll("rect")
        .data(capitals.features)
        .enter()
        .append("rect")
        .attr("id", d => { return "rect-noise-min-" + d.properties["iso2"] })
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] + 5)
        .attr("width", 0)
        .attr("height", 2)
        .attr("shape-rendering", "crispEdges")
        .attr("fill", "green");

    const text_noise_avg = map_g.append("g").selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr("id", d => { return "text-noise-avg-" + d.properties["iso2"] })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] + 10)
        .attr("font-size", 4)

    const rect_noise_avg = map_g.append("g").selectAll("rect")
        .data(capitals.features)
        .enter()
        .append("rect")
        .attr("id", d => "rect-noise-avg-" + d.properties["iso2"])
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] + 15)
        .attr("width", 0)
        .attr("height", 2)
        .attr("shape-rendering", "crispEdges")
        .attr("fill", "blue");

    const text_noise_max = map_g.append("g").selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr("id", d => { return "text-noise-max-" + d.properties["iso2"] })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] + 20)
        .attr("font-size", 4)

    const rect_noise_max = map_g.append("g").selectAll("rect")
        .data(capitals.features)
        .enter()
        .append("rect")
        .attr("id", d => "rect-noise-max-" + d.properties["iso2"])
        .attr("x", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] + 25)
        .attr("width", 0)
        .attr("height", 2)
        .attr("shape-rendering", "crispEdges")
        .attr("fill", "red");

    // https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
    var Tooltip = d3.select("#map-glyph-container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("width", "200px")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    const country_labels = map_g.append("g").selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr('id', d => { return `text-glyph-${d.properties['iso2']}` })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0])
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 5)
        .attr("font-size", 16)
        .attr("font-weight", 800)
        .text(d => d.properties.country);

    function zoomed({ transform }) {
        map_g.attr("transform", transform);
        map_g.select("path")
            .attr("stroke-width", 1 / transform.k);
        data_g.attr("transform", transform);
        data_g.selectAll("circle")
            .attr("r", 2 / transform.k);
        country_labels.attr("font-size", 16 / transform.k);
        text_noise_min.attr("font-size", 16 / transform.k);
        text_noise_max.attr("font-size", 16 / transform.k);
        text_noise_avg.attr("font-size", 16 / transform.k);

        // text_noise_min.attr("stroke-width", 1 / transform.k);
        // text_noise_max.attr("stroke-width", 1 / transform.k);
        // text_noise_avg.attr("stroke-width", 1 / transform.k);

    }

    const zoom = d3.zoom()
        .scaleExtent([0.25, 16])
        .on("zoom", zoomed);

    svg.call(zoom);

    const p = setInterval(async function () {
        counter++;
        if (counter == 24) counter = 0;
        startTime = `${String(counter).padStart(2, '0')}:00:00`;
        endTime = `${String(counter + 1).padStart(2, '0')}:00:00`;
        await addGlyphData(startTime, endTime);
    }, 5000);
}


async function initHumidityMap(type) {
    var counter = 0;
    var startTime = `${String(counter).padStart(2, '0')}:00:00`;
    var endTime = `${String(counter + 1).padStart(2, '0')}:00:00`;
    // Clear previous svg
    d3.select("#humidity-container").selectAll("svg").remove();

    // get data from flask-server
    // load map materials
    // europe.geojson is from https://github.com/leakyMirror/map-of-europe/tree/master/GeoJSON
    const europe = await d3.json("./data/europe.geojson") // contains all countries of europe
    const countries = europe.features.map(d => d.properties.ISO2);
    // capitals.geojson is from https://github.com/Stefie/geojson-world/blob/master/capitals.geojson
    let capitals = await d3.json("./data/capitals.geojson") // contains all captials of all countries
    // filter capitals which are in europe
    capitals.features = capitals.features.filter(d => countries.includes(d.properties.iso2) && d.properties.city != "Vatican City")
    const map_container = d3.select("#humidity-container");

    const svg = map_container
        .append("svg")
        .attr("id", "map-humidity")
        .attr("width", width)
        .attr("height", height);

    const map_g = svg.append("g");
    const data_g = svg.append("g");

    const geo_projection = d3.geoMercator().scale(700).center([15, 65])
    const path = d3.geoPath(geo_projection);

    map_g.selectAll("path").data(europe.features).join("path")
        .attr("d", path)
        // set the color of each country
        .attr("fill", function (d) {
            return "lightgray";
        })
        .attr("id", (d) => { return "land-" + d.properties["ISO2"]; })
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round").attr("stroke-color", "black");

    const country_markers = map_g.selectAll("circle")
        .data(capitals.features)
        .enter()
        .append("circle")
        .attr('id', d => { return `rect-land-${d.properties['iso2']}` })
        .attr("cx", d => geo_projection(d.geometry.coordinates)[0] - 5)
        .attr("cy", d => geo_projection(d.geometry.coordinates)[1] - 5)
        .attr("r", 20)
        .attr("fill", "#90e0ef")
        .attr("opacity", 0);

    // https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
    var Tooltip = d3.select("#humidity-container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    var mousemove = function (event) {
        const countryCode = event.target.id.split('-').pop()
        const hoveredCountry = particulateData.find(e => e.cc === countryCode)
        var text = "No data found";
        if (hoveredCountry) text = `Country:${event.target.textContent}<br/>Average ${type}: ${Math.round(hoveredCountry.P_AVG)}`
        var coords = d3.pointer(event);
        var mouse = [coords[0], coords[1]];
        Tooltip
            .html(text)
            .style("left", (mouse[0]) + "px")
            .style("top", (mouse[1] + 20) + "px")
    }
    var mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    const country_labels = map_g.selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr('id', d => { return `text-land-${d.properties['iso2']}` })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0])
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 14)
        .attr("font-size", 16)
        .text(d => d.properties.country)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    map_g.append("g").selectAll("text")
        .data(capitals.features)
        .enter()
        .append("text")
        .attr('id', d => { return `text-humidity-${d.properties['iso2']}` })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("x", d => geo_projection(d.geometry.coordinates)[0])
        .attr("y", d => geo_projection(d.geometry.coordinates)[1] - 7)
        .attr("font-size", 8)
        .text(d => d.properties.country)

    // const response = await fetch("http://127.0.0.1:8080/api/v1/get_data/sds011/12:00:00/12:05:00");
    // const data = await response.json();

    function zoomed({ transform }) {
        map_g.attr("transform", transform);
        map_g.select("path")
            .attr("stroke-width", 1 / transform.k);
        data_g.attr("transform", transform);
        data_g.selectAll("circle")
            .attr("r", 2 / transform.k);
        country_labels.attr("font-size", 16 / transform.k);
        country_markers.attr("stroke-width", 1 / transform.k);
    }

    const zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on("zoom", zoomed);

    svg.call(zoom);

    await addHumidityData(startTime, endTime);

    interval = setInterval(async function () {
        counter++;
        if (counter == 24) counter = 0;
        startTime = `${String(counter).padStart(2, '0')}:00:00`;
        endTime = `${String(counter + 1).padStart(2, '0')}:00:00`;
        await addHumidityData(startTime, endTime);
    }, 5000);

}

initParticulateMap(particulateType);
initGlyphMap();
initHumidityMap();

document.getElementById("button-change-particulate-type").onclick = () => {
    if (particulateType === "P1") { particulateType = "P2" }
    else { particulateType = "P1" };
    clearInterval(interval);
    initParticulateMap(particulateType)
}