
//Data Table: People Vaccinated
//Source: RKI
//State,total number of people vaccinated,number of people vaccinated once,number of people vaccinated completely,number of people with booster vaccination,total vaccination rate (once),vaccination rate (once) 12-17 years old,vaccination rate (once) 18+ years old,vaccination rate (once) 18-59 years old,vaccination rate (once) 60+ years old,total vaccination rate (completely),vaccination rate (completely) 12-17 years old,vaccination rate (completely) 18+ years old,vaccination rate (completely) 18-59 years old,vaccination rate (completely) 60+ years old
const data = [["Baden-Württemberg",14174420,7328255,7084790,180951,66,40.3,76.7,69,85.1,63.8,35.4,74.5,70.1,83.3],
				["Bayern",16655013,8620326,8319788,157501,65.6,40.2,76,68.5,84.2,63.3,34.7,73.7,69.3,82.4],
				["Berlin",4900744,2506923,2405901,97685,68.4,40.7,79.6,71.9,88.7,65.7,36.5,76.6,72,87.3],
				["Brandenburg",3004945,1576239,1508431,21964,62.3,31.2,71.8,60,79.8,59.6,26.1,69.3,62,80.3],
				["Bremen",1040508,545824,522454,15105,80.3,48.4,93,88.7,94,76.8,42.1,89.3,88,92],
				["Hamburg",2583147,1351746,1297620,19481,73,43.4,85.1,79.3,87.8,70,36.8,82.1,80.5,85.9],
				["Hessen",8255562,4313432,4078209,91823,68.5,44.4,79.5,72,86.5,64.8,38.1,75.4,71.3,83.5],
				["Mecklenburg-Vorpommern",2056880,1069555,1030856,15829,66.4,30.1,76.6,66.3,85.1,64,24.6,74.1,67,84.4],
				["Niedersachsen",10787319,5712142,5415753,68218,71.4,51.9,82.2,72.1,89.8,67.7,45.1,78.2,73.2,87.4],
				["Nordrhein-Westfalen",25082704,13136562,12392885,306809,73.3,52.1,84.6,76.5,90.1,69.1,46,80,76,87.8],
				["Rheinland-Pfalz",5491803,2886340,2688285,68809,70.4,46.5,81.2,71.9,89.3,65.6,37.9,76,70.8,85.5],
				["Saarland",1420271,738966,711363,13570,75.1,47.6,85.4,76.4,90.5,72.3,40.7,82.5,78.2,89.5],
				["Sachsen",4573617,2370615,2268445,29798,58.4,26.8,67.8,57.7,77.9,55.9,23.1,65.1,56.3,78.1],
				["Sachsen-Anhalt",2682425,1397649,1353497,31019,64.1,28.3,73.6,61.6,82.3,62.1,22.7,71.6,63.1,83.4],
				["Schleswig-Holstein",4123228,2133781,2050714,67054,73.3,57.9,85.2,78.3,89.5,70.5,51.7,82.1,78.2,88.8],
				["Thüringen",2522770,1301178,1265448,29869,61.4,28.9,70.7,59.7,80.8,59.7,25.6,68.9,60.3,81.3],
				["Total",109725662,57182706,54579415,1215759,68.8,44,79.5,71.4,86.5,65.6,38.2,76.2,71.6,84.8]];

const totalVaccinations = data.filter(row => row[0] === "Total").map(row => row[1])[0];
const total_vaccination_rate = data.filter(row => row[0] === "Total")
								.map(row => [{ key: "Vaccinated once" , value: row[5]},{ key: "Vaccinated completely" , value : row[10]}])[0]

const dataVaccinationCountByState = {}
data.filter(row => row[0] !== "Total")
	.map(row => [row[0], row[1]])
	.sort((a, b) => b[1] - a[1])
	.forEach(element => dataVaccinationCountByState[element[0]] = element[1])

const dataVaccinationRateByStateCompletely = {}
data.filter(row => row[0] !== "Total")
	.map(row => [row[0], row[10]])
	.sort((a, b) => b[1] - a[1])
	.forEach(element => dataVaccinationRateByStateCompletely[element[0]] = element[1])

const dataVaccinationRateByStateOnce = {}
data.filter(row => row[0] !== "Total")
	.map(row => [row[0], row[5]])
	.sort((a, b) => b[1] - a[1])
	.forEach(element => dataVaccinationRateByStateOnce[element[0]] = element[1])
