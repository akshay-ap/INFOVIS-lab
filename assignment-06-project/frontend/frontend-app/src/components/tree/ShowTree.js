import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const ShowTree = ({ data }) => {

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (loaded) return;
        // set the dimensions and margins of the graph
        const width = 800;
        const height = 800;

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
            .attr("stroke", '#ccc')

        const makeId = () => {
            let ID = "";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for (var i = 0; i < 12; i++) {
                ID += characters.charAt(Math.floor(Math.random() * 36));
            }
            return ID;
        }
        const idMap = {};
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
                console.log("creating node", newId)
                idMap[newId] = d;
                return newId;
            })
            .style("fill", "#69b3a2")
            .attr("stroke", "black")
            .style("stroke-width", 2).on('mouseover', function (d, i) {
                d3.select(this).transition()
                    .duration('100')
                    .attr("r", 7);
            })
            .on("mouseover", function (d) {
                d3.select(this).transition()
                    .duration('200')
                    .attr("r", 40);
            })
            //     console.log("Mosue over", d.target.id)
            //     d3.select('body').select(d.target.id).style("fill", "blue");
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                    .duration('200')
                    .attr("r", 20);
            });


        // .on("mouseover", function (d) {
        //     console.log("Mosue over", d.target.id)
        //     d3.select('body').select(d.target.id).style("fill", "blue");
        // }).on("mouseout", function (d) {
        //     console.log("mouseout", d.target.id)
        //     d3.select('body').select(d.target.id).style("fill", "#69b3a2");
        // });

        console.log("Node id map:", idMap)
        setLoaded(true);
    }, [loaded])

    return (<div>
        <div id="show-tree">
            <div id="my_dataviz"></div>
        </div>
    </div>)
}

export default ShowTree