import * as d3 from "d3";

const incomeGroups = ["Low income", "Lower middle income", "Upper middle income", "High income"];

const incomeGroupColors = d3.scaleOrdinal()
    .domain(incomeGroups)
    .range(["#0077b6", "#f35b04", "#ffd100", "#0f4c5c"]);

export {
    incomeGroupColors, incomeGroups
}