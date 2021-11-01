// https://www.d3-graph-gallery.com/graph/donut_basic.html

const donutChart = (data, id) => {
data['non-vaccinated'] = 100 - data['vaccinated']

// set the dimensions and margins of the graph
const width = 450,
    height = 450,
    margin = 40;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
const radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
const svg = d3.select('main').select('#donutCharts').select(id)
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

//text element to age group
svg.append("text")
    .attr("x",-20)
    .attr("y",0)
    .attr("dy",-3)
    .text(data['vaccinated']+ '%')    

// set the color scale
const color = d3.scaleOrdinal()
  .range(["#0069c0", "#808080"])

// Compute the position of each group on the pie:
const pie = d3.pie()
  .value(d=>d[1])
  
const data_ready = pie(Object.entries(data))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('div')
  .data(data_ready)
  .join('path')
  .attr('d', d3.arc()
    .innerRadius(100)         // This is the size of the donut hole
    .outerRadius(radius)
  )
  .attr('fill', d => color(d.data[0]))
  .style("opacity", 0.7)
}

const data1 = {'vaccinated': 76.7}
const data2 = {'vaccinated': 74.5}

donutChart(data1, "#fig-1")
donutChart(data2, "#fig-2")
