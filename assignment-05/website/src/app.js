document.getElementById("name").innerText = "Akshay Patel";;
document.getElementById("assignment_number").innerText = "5";
/////////////////////////////////////////////////////
import * as d3 from "d3";

const fetchData = async (url) => {

    const response = await fetch(`http://localhost:8080${url}`);
    const data = await response.json();
    return data;
}

// Getting data from file to avoid CORS error.
const getDataFromFile = async (fileName) => {
    const data = await d3.json(fileName);
    return data;
}

const plotAuthorkeywordsYear = async () => {

    // const data = await fetchData('/api/v1/get-data/authorkeywords-year');
    const data = await getDataFromFile('./authorKeywords-year.json')
    console.log("plotAuthorkeywordsYear", data);

    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#plot-authorkeywords-year")
        .append("svg")
        .style("background-color", '#e3f2fd')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const sortedXData = data.sort((a, b) => a.tsne[0] - b.tsne[0]);
    const xMin = sortedXData[0].tsne[0],
        xMax = sortedXData[sortedXData.length - 1].tsne[0];

    console.log("xMin", xMin);
    console.log("xMax", xMax);

    const x = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const sortedYData = data.sort((a, b) => a.tsne[1] - b.tsne[1]);
    const yMin = sortedYData[0].tsne[1],
        yMax = sortedYData[sortedYData.length - 1].tsne[1]
    console.log("yMin", yMin);
    console.log("yMax", yMax);

    const y = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));


    // Define colors
    const sortedYearData = data.sort((a, b) => a.Year - b.Year);
    const yearMin = sortedYearData[0].Year,
        yearMax = sortedYearData[sortedYearData.length - 1].Year;
    const color = d3.scaleSequential(d3.interpolate("yellow", "purple")).domain([yearMin, yearMax]);

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
        const index = event.target.id.split('-').pop()
        console.log("index", index, data[index])
        var text = "No data found";
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


    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", function (d) { return x(d.tsne[0]); })
        .attr("cy", function (d) { return y(d.tsne[1]); })
        .attr("r", 3)
        // .append("rect")
        // .attr("x", d => d.tsne[0])
        // .attr("y", d => d.tsne[1])
        // .attr("width", 2)
        // .attr("height", 2)
        .attr('id', (d, idx) => `tsne-${idx}`)
        .style("fill", (d) => color(d.Year))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    const svgLegend = d3.select("#plot-authorkeywords-year-legend")
        .append("svg")
        .style("background-color", '#fff')
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    drawLegend(svgLegend, color);
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

const plotAbstractConference = async () => {
    // const data = await fetchData('/api/v1/get-data/abstract-conference');
    const data = await getDataFromFile('./abstract-conference.json')

    console.log("plotAbstractConference", data);

    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#plot-abstract-conference")
        .append("svg")
        .style("background-color", '#e3f2fd')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const sortedXData = data.sort((a, b) => a.pca[0] - b.pca[0]);
    const xMin = sortedXData[0].pca[0],
        xMax = sortedXData[sortedXData.length - 1].pca[0];

    console.log("xMin", xMin);
    console.log("xMax", xMax);

    const x = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const sortedYData = data.sort((a, b) => a.pca[1] - b.pca[1]);
    const yMin = sortedYData[0].pca[1],
        yMax = sortedYData[sortedYData.length - 1].pca[1]
    console.log("yMin", yMin);
    console.log("yMax", yMax);

    const y = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));


    // Define colors
    const conferences = data.map(e => e.Conference)
    var uniqueConferences = conferences.filter((v, i, a) => a.indexOf(v) === i);
    const color = d3.scaleOrdinal().domain(uniqueConferences).range(d3.schemeSet3);

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", function (d) { return x(d.pca[0]); })
        .attr("cy", function (d) { return y(d.pca[1]); })
        .attr("r", 3)
        .attr('id', '')
        .style("fill", (d) => color(d.Conference));

    var legend = svg.selectAll(".legend")
        .data(uniqueConferences)//hard coding the labels as the datset may have or may not have but legend should be complete.
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * (20) + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) { return color(d) });

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; });
}

plotAuthorkeywordsYear()
plotAbstractConference()