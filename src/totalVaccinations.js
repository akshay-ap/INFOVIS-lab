d3.select("main").select('#total-vaccinations').append("text").text('Total vaccinations: ').classed('totalVaccinations', true);
d3.select("main").select('#total-vaccinations').append("text").text(totalVaccinations).style("font-weight", "bold").classed('totalVaccinations', true);
