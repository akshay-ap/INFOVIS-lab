document.getElementById("name").innerText = "Akshay Patel";
document.getElementById("assignment_number").innerText = "3";
/////////////////////////////////////////////////////
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";


const width = 1000;
const height = 900;
const margin = { top: 20, bottom: 50, left: 50, right: 20 };

const getGraph = async () => {

    const graph = await d3.json("data/graph.json");

    console.log("graph", graph)
    return graph
}

const createSankeyChart = async () => {

    const width = 960;
    const height = 600;

    const graph = await getGraph();

    const svg = d3.select("main").select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "my-sankey")

    const sankey = d3Sankey.sankey().nodeWidth(15).nodePadding(10).extent([[1, 1], [width - 10, height - 10]])
    const { nodes, links } = sankey({ nodes: graph["nodes"], links: graph["links"] });


    const l = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .selectAll("path")
        .data(graph["links"])
        .join("path")
        .attr("d", d3Sankey.sankeyLinkHorizontal())
        .attr("stroke-width", function (d) { if (d.width === 0) return 0; return 1 + d.width; }); // min width of a line = 1 if weight != 0

    // const link = svg.append("g")
    //     .attr("fill", "none")
    //     .attr("stroke-opacity", 0.3)
    //     .selectAll("g")
    //     .data(graph["links"])
    //     .join("g")
    //     .style("mix-blend-mode", "multiply");

    const nodeStroke = "gray", // stroke around node rects
        nodeStrokeWidth = 0, // width of stroke around node rects, in pixels
        nodeStrokeOpacity = 0.5, // opacity of stroke around node rects
        nodeStrokeLinejoin = 5;

    const node = svg.append("g")
        .attr("stroke", nodeStroke)
        .attr("stroke-width", nodeStrokeWidth)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-linejoin", nodeStrokeLinejoin)
        .selectAll("rect")
        .data(graph["nodes"])
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0);

    node.attr("fill", ({ index: i }) => {
        if (nodes[i].type === "price") return '#38b000';
        if (nodes[i].type === "owners") return '#f48c06';
        if (nodes[i].type === "rating") return '#48cae4';
        return 'blue'
    });


    svg.append("g")
        .style("font", "10px sans-serif")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => { return `[${d.name}]` })
        .append("tspan")
        .attr("fill-opacity", 0.7)
        .text(d => ` ${d.value.toLocaleString()}`);
}

async function init() {
    await createSankeyChart();
}

init();