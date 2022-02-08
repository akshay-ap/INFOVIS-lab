import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { incomeGroupColors } from '../../constants'
import { LegendIncomeGroups, LegendIndicators } from '../Legend';
import { Grid } from "@mui/material";

const ShowTree = ({ data, indicators }) => {
    const indicatorColors = d3.scaleOrdinal()
        .domain(indicators)
        .range(d3.schemeSet3);

    const createTree = (data) => {
        const width = 900;
        const height = 800;

        d3.select('body').select("#show-tree").selectAll("*").remove();
        d3.select('body').select("#my_dataviz2").selectAll("*").remove();

        // append the svg object to the body of the page
        const svg = d3.select('body').select("#show-tree")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(40,0)");  // bit of margin on the left = 40

        // read json data

        // Create the cluster layout:
        const cluster = d3.cluster()
            .size([height, width - 100]);  // 100 is the margin I will have on the right side

        // Give the data to this cluster layout:
        const root = d3.hierarchy(data, function (d) {
            return d.children;
        });
        cluster(root);


        // Add the links between nodes:
        svg.selectAll('path')
            .data(root.descendants().slice(1))
            .join('path')
            .attr("d", function (d) {
                return "M" + d.y + "," + d.x
                    + "C" + (d.parent.y + 50) + "," + d.x
                    + " " + (d.parent.y + 150) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                    + " " + d.parent.y + "," + d.parent.x;
            })
            .style("fill", 'none')
            .attr("stroke", d => {
                return '#ccc'
            })

        const makeId = () => {
            let ID = "";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < 12; i++) {
                ID += characters.charAt(Math.floor(Math.random() * 36));
            }
            return ID;
        }
        const idMap = {};


        const tooltip = d3.select('body').select("#my_dataviz2")
            .append("div")
            .attr('id', 'tree-toolip')
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        const mouseover = function (event, d) {
            tooltip
                .style("opacity", 1)
        }

        const mousemove = function (event, d) {
            tooltip
                .html(`Name: ${d.data.name}`)
                .style("left", (event.x) / 2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (event.y) / 2 + "px")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        const mouseleave = function (event, d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }


        // Add a circle for each node.
        svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", function (d) {
                return `translate(${d.y},${d.x})`
            })
            .append("circle")
            .attr("r", 20)
            .attr("id", (d) => {
                const newId = `node-${makeId()}`;
                idMap[newId] = d;
                return newId;
            })
            .style("fill", (d) => {
                if (!d.data.children) {
                    return incomeGroupColors(d.data.label)
                }
                return indicatorColors(d.data.label);
            })
            .attr("stroke", "black")
            .on("mouseover", function (event, d) {
                // console.log("mouseover", this.id)
                mouseover(event, d);
                d3.select(this).transition()
                    .duration('200')
                    .attr("r", 40);
            }).on('mouseleave', function (event, d) {
                mouseleave(event, d)
                d3.select(this).transition()
                    .duration('200')
                    .attr("r", 20);
                mouseleave()
            })
            .on('mousemove', function (event, d) {
                mousemove(event, d);
            })

        svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", function (d) {
                return `translate(${d.y},${d.x})`
            })
            .append("text")
            .attr("id", (d) => {
                const newId = `node-text-${makeId()}`;
                idMap[newId] = d;
                return newId;
            })
            .style("fill", (d) => {
                return "black";
            })
            .text((d) => {
                if (!d.data.children) return;
                if (d.data['name'].length > 25) {
                    return `${d.data['name'].substring(0, 25)}...`;

                }
                return d.data['name'];
            });
    }

    createTree(data);

    return (<div>

        <Grid container spacing={2} direction="row" justifyContent="flex-start">
            <Grid item md={6}>
                <LegendIndicators indicatorColors={indicatorColors} indicators={indicators} />
            </Grid>
            <Grid item md={6}>
                <LegendIncomeGroups />
            </Grid>
        </Grid>
        <div id="my_dataviz2"></div>
        <div id="show-tree">
        </div>
    </div>)
}

export default ShowTree