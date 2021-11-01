
const barChartStateVaccinationRate = (dataVaccinationRateByState, id) => {

    let margin2 = {top: 20, right: 50, bottom: 30, left: 150};
    let svgWidth2 = 800, svgHeight2 = 600;
    let height2 = svgHeight2 - margin2.top - margin2.bottom, width2 = svgWidth2 - margin2.left - margin2.right;
    let stateName2 = [], vaccinationRate = [];
    
    console.log(dataVaccinationRateByState)
    let x2 = d3.scaleLinear().domain([0, 100]).rangeRound([0, width2]),
        y2 = d3.scaleBand().rangeRound([0, height2]).padding(0.1);
    
    for(let key in dataVaccinationRateByState){
        if(dataVaccinationRateByState.hasOwnProperty(key)){
            stateName2.push(key);
            vaccinationRate.push(parseInt(dataVaccinationRateByState[key]));
        }
    }
    
    x2.domain([0, 100]);
    y2.domain(stateName2);
    
    let svg2 = d3.select("main").select(id).append("svg");
    svg2.attr('height', svgHeight2)
       .attr('width', svgWidth2);
    
    svg2 = svg2.append("g")
             .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
    
    svg2.append("g")
        .attr("transform", "translate(0, " + height2 + ")")
        .call(d3.axisBottom(x2));
    
    svg2.append("g")
        .classed("barGraphLeftAxis", true)
        .call(d3.axisLeft(y2));
            
    // Create rectangles
    let bars2 = svg2.selectAll('.bar')
        .data(stateName2)
        .enter()
        .append("g").style("width", 50 + 'px').style("font-size" , "18px");
    
    bars2.append('rect')
        .attr('class', 'bar')
        .attr("x", function(d) { return 0; })
        .attr("y", function(d) { return y2(d); })
        .attr("width", function(d){return x2(dataVaccinationRateByState[d])})
        .attr("height", function(d) { return y2.bandwidth(); })
        .attr("fill",'#0069c0');
        
    bars2.append("text")
        .text(function(d) { 
            return dataVaccinationRateByState[d];
        })
        .attr("x", function(d){
            return x2(dataVaccinationRateByState[d]) + 1;
        })
        .attr("y", function(d){
            return y2(d) + y2.bandwidth() * (0.5 + 0.1); // here 0.1 is the padding scale
        })
        .attr("font-size" , "18px")
        .attr("fill" , "black")
        .attr("text-anchor", "left");
}

barChartStateVaccinationRate(dataVaccinationRateByStateOnce, "#state-vaccination-rate-once")
barChartStateVaccinationRate(dataVaccinationRateByStateCompletely, "#state-vaccination-rate-completely")