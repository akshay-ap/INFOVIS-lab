document.getElementById("name").innerText = "Akshay Patel";
document.getElementById("assignment_number").innerText = "2";
/////////////////////////////////////////////////////
import * as d3 from "d3";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";

const monthsMap = {
  'Jan.': "Jan.", 'Feb.': "Feb.", 'March': "Mar.",
  'Apr.': "Apr.", 'May': "May", 'Jun.': "Jun.",
  'Jul.': "Jul.", 'Aug.': "Aug.", 'Sept.': "Sep.",
  'Oct.': "Oct.", 'Nov.': "Nov.", 'Dec.': "Dec."
};

const monthValues = Object.values(monthsMap);

var selectedStations = []

const readData = async () => {

  let mainData = await d3.dsv(",", "./data/historical_weather.csv");
  // Pre-process data
  // Trim city names
  mainData = mainData.map(row => { return { ...row, "Station name": row["Station name"].trim() } })

  // Make month names consistent
  mainData = mainData.map(row => {
    var newObj = { ...row };
    Object.keys(monthsMap).forEach(m => {
      var temp = newObj[m]
      delete newObj[m]
      newObj[monthsMap[m]] = temp
    })
    return newObj
  })

  console.log("processed data", mainData)

  return mainData
}

async function init() {

  let mainData = await readData();
  const stationNames = [...new Set(mainData.map(row => row["Station name"]))];
  createDropdown(stationNames, 'station-0');
  createDropdown(stationNames, 'station-1');
  createDropdown(stationNames, 'station-2');
  createDropdown(stationNames, 'station-3');

  // Display yearly data and monthly data
  await updateData();
}


const updateData = async () => {

  // Remove any old graphs
  d3.selectAll("#graph-info").remove();

  let mainData = await readData();

  // Filter yearly data.
  const yearlyData = mainData.filter((element) => (selectedStations.includes(element["Station name"])))
    .map((e) => {
      return {
        'station_name': e['Station name'],
        'type': e['Type'].trim(),
        'value': e["Year"]
      }
    });

  await addYearlyData(yearlyData);

  // Display monthly graphs of 7 paramters.
  await displayGraphs(mainData, selectedStations)
}

const displayGraphs = async (mainData, selected_cities) => {

  const rows1 = filterData(mainData, selected_cities, "Ice days")
  await createGraph(rows1, '#graph-ice-days', '1');

  const rows2 = filterData(mainData, selected_cities, "Hot days")
  await createGraph(rows2, '#graph-hot-days', '2');

  const rows3 = filterData(mainData, selected_cities, "Frost days")
  await createGraph(rows3, '#graph-frost-days', '3');

  const rows4 = filterData(mainData, selected_cities, "Summer days")
  await createGraph(rows4, '#graph-summer-days', '4');

  const rows5 = filterData(mainData, selected_cities, "Temperature ")
  await createGraph(rows5, '#graph-temperature', '5');

  const rows6 = filterData(mainData, selected_cities, "Sunshine Duration")
  await createGraph(rows6, '#graph-sunshine', '6');

  const rows7 = filterData(mainData, selected_cities, "Percipitation")
  await createGraph(rows7, '#graph-percipitation', '7');

}

const createGraph = async (data, id, lineId) => {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 500 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select('main').select(id)
    .append("svg")
    .attr("id", "graph-info")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const sumstat = d3.group(data, d => d["station_name"]); // nest function allows to group the calculation per level of a factor

  var x = d3.scalePoint()
    .range([0, width])
    .domain(monthValues.map(function (d) {
      return d
    }));

  var xAxis = d3.axisBottom(x)
    .tickFormat(function (d, i) {
      return d;
    });

  var inverseModeScale = d3.scaleQuantize()
    .domain(x.range())
    .range(x.domain());

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Add Y axis
  var minY = d3.min(data, function (d) { return +d.n; })
  if (minY > 0) minY = 0;

  const y = d3.scaleLinear()
    .domain([minY, d3.max(data, function (d) { return +d.n; })])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  const colorPalette = ['#4363d8', '#800000', '#3cb44b', '#911eb4']
  // color palette
  const color = d3.scaleOrdinal()
    .range(colorPalette)
  // #3cb44b -> green,  #800000 -> maroon, #4363d8 -> blue, #911eb4 -> purple
  // Draw the line

  svg.selectAll(".line" + lineId)
    .data(sumstat)
    .join("path")
    .attr("fill", "none")
    .attr("class", "line" + lineId)
    .attr("stroke", function (d) { return color(d[0]) })
    .attr("stroke-width", 1.5)
    .attr("d", function (d) {
      return d3.line()
        .x(function (d) { return x(d.month); })
        .y(function (d) { return y(+d.n); })
        (d[1])
    })

  var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects" + lineId);


  mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line" + lineId)
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  var lines = document.getElementsByClassName('line' + lineId);

  var mousePerLine = mouseG.selectAll('.mouse-per-line' + lineId)
    .data(d3.range(lines.length))
    .enter()
    .append("g")
    .attr("class", "mouse-per-line" + lineId);

  mousePerLine.append("circle")
    .attr("r", 7)
    .style("stroke", function (d) {
      return colorPalette[d];
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine.append("text")
    .attr("transform", "translate(10,3)");


  mouseG.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function () { // on mouse out hide line, circles and text
      d3.select(".mouse-line" + lineId)
        .style("opacity", "0");
      d3.selectAll(`.mouse-per-line${lineId} circle`)
        .style("opacity", "0");
      d3.selectAll(`.mouse-per-line${lineId} text`)
        .style("opacity", "0");
    })
    .on('mouseover', function () { // on mouse in show line, circles and text
      d3.select(".mouse-line" + lineId)
        .style("opacity", "1");
      d3.selectAll(`.mouse-per-line${lineId} circle`)
        .style("opacity", "1");
      d3.selectAll(`.mouse-per-line${lineId} text`)
        .style("opacity", "1");
    })
    .on('mousemove', function (event) { // mouse moving over canvas
      var coords = d3.pointer(event);
      var mouse = [coords[0], coords[1]];

      // // move the vertical line
      d3.select(".mouse-line" + lineId)
        .attr("d", function () {
          var d = "M" + mouse[0] + "," + height;
          d += " " + mouse[0] + "," + 0;
          return d;
        });

      // position the circle and text
      d3.selectAll(".mouse-per-line" + lineId)
        .attr("transform", function (d, i) {

          // from http://bl.ocks.org/duopixel/3824661
          var beginning = 0,
            end = lines[i].getTotalLength(),
            target = null;

          while (true) {
            target = Math.floor((beginning + end) / 2);
            var pos = lines[i].getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
              break;
            }
            if (pos.x > mouse[0]) end = target;
            else if (pos.x < mouse[0]) beginning = target;
            else break; //position found
          }

          d3.select(this).select('text')
            .text(y.invert(pos.y).toFixed(2) + ` ${selectedStations[i]}`);

          return "translate(" + mouse[0] + "," + pos.y + ")";
        });
    });
}

const addYearlyData = async (data) => {

  const typeIdMap = {
    'Ice days': '#ice-days',
    "Frost days": "#frost-days",
    "Summer days": "#summer-days",
    "Hot days": "#hot-days",
    "Percipitation": "#percipitation",
    "Temperature": "#temperature",
    "Sunshine Duration": '#sunshine-duration'
  }

  Object.keys(typeIdMap).forEach((key) => {
    const typeData = data.filter(e => e["type"] === key)

    d3.select('main')
      .select('#yearly-data')
      .select(typeIdMap[key]).selectAll('p').remove()

    d3.select('main')
      .select('#yearly-data')
      .select(typeIdMap[key]).append("p")
      .attr("id", "graph-info")
      .append("text")
      .style("font-weight", '800')
      .text(key);

    for (var d = 0; d < typeData.length; d++) {
      var newDiv = d3.select('main')
        .select('#yearly-data')
        .select(typeIdMap[key]).append("p");

      newDiv.append("text")
        .text(typeData[d]['station_name'] + ':\t' + typeData[d]['value']);
    }
  })

}

const createDropdown = (stationNames, id) => {

  var index = parseInt(id.split('-')[1])
  selectedStations.push(stationNames[index])

  const div = document.getElementById(id);
  stationNames.forEach(stationName => {
    div.innerHTML += `<option value="${stationName.trim()}">${stationName}</option>`;
  })

  div.value = stationNames[index].trim();

  document.getElementById(id).addEventListener('change', async function () {
    var index = parseInt(this.id.split('-')[1])
    if (selectedStations.includes(this.value)) {
      alert(`${this.value} already selected`)
    }
    selectedStations[index] = this.value;
    await updateData();
  });


}

const filterData = (mainData, stationNames, type) => {
  const data = mainData.filter((element) => {
    return (stationNames.includes(element["Station name"]) && element["Type"] === type)
  });

  var rows = []
  for (let i = 0; i < data.length; i++) {
    for (let m = 0; m < monthValues.length; m++) {
      let month = monthValues[m]
      rows.push({
        'month': month, 'station_name': data[i]["Station name"], 'n': data[i][month]
      })
    }
  }
  return rows
}

init();

// References
// https://plnkr.co/edit/819nUOzwnR3nTEd6uSUK?p=preview&preview
// https://jsfiddle.net/3wzLv9yg/2/
// https://stackoverflow.com/questions/29440455/how-to-as-mouseover-to-line-graph-interactive-in-d3