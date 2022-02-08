import * as d3 from "d3";

const incomeGroups = ["Low income", "Lower middle income", "Upper middle income", "High income"];

const incomeGroupColors = d3.scaleOrdinal()
    .domain(incomeGroups)
    .range(["#f35b04", "#ffd100", "#43B0F1", "#057DCD"]);

export {
    incomeGroupColors, incomeGroups
}