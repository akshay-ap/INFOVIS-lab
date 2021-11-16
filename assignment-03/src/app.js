document.getElementById("name").innerText = "{insert your name here}";
document.getElementById("assignment_number").innerText = "3";
/////////////////////////////////////////////////////
import * as d3 from "d3";

const width = 960;
const height = 500;
const margin = {top: 20, bottom: 50, left: 50, right: 20};

async function init() {
    const data = await d3.json("./data/iris.json");
    console.log(data);

    const svg = d3.select("main")
        .append("svg")
            .attr("width", width)
            .attr("height", height);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.sepalwidth))
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.sepallength))
        .range([margin.top, height - margin.bottom]);
    const color_scale = d3.scaleOrdinal(d3.schemeTableau10);

    const axis_x = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    axis_x.append("text")
        .attr("y", 30)
        .attr("x", width - margin.right)
        .attr("text-anchor", "end")
        .attr("fill", "currentColor")
        .text("sepal width →");

    const axis_y = svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    axis_y
        .append("g")
            .attr("transform", `translate(-40, ${margin.top}) rotate(-90)`)
        .append("text")
            .attr("text-anchor", "end")
            .attr("fill", "currentColor")
            .text("sepal length →");

    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
            .attr("cx", d => x(d.sepalwidth))
            .attr("cy", d => y(d.sepallength))
            .attr("r", 3)
            .attr("fill", d => color_scale(d.class));
}

init();

