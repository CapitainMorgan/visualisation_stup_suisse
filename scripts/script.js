//map
//https://www.d3indepth.com/geographic/

const BASECOLOR = "#60ff10";
let year = 2017;
let gender = "Total";
let type = 0;
let datapath =
  "./datasets/Cannabis_map_dataset/" + year + "-"+  type + ".csv";
const types = [
  "Au moins une fois par mois",
  "Au moins une fois au cours des 12 derniers mois",
];


let currentMapData = [];

let projection = d3
  .geoMercator()
  .scale(7000)
  .translate([170, 250])
  .center([7.2255, 46.8145]);

let geoGenerator = d3.geoPath().projection(projection);

function handleMouseover(e, d) {
  // show popup with canton name and value
  let canton = d.properties.name;
  let bounds = geoGenerator.bounds(d);
	
  let value = currentMapData.filter(function (row) {
	return row.canton == canton && row.Gender == gender;
  });
  let popup = d3.select("#popup text")  
	.attr('x', bounds[0][0])
	.attr('y', bounds[0][1])
	.attr('width', bounds[1][0] - bounds[0][0])
	.attr('height', bounds[1][1] - bounds[0][1]);
  
  if(value && value[0]["Proportion de la population en %"] != ".")
	popup.html(
		"" +
		canton +
		"<tspan x=" + bounds[0][0] +" y=" + (bounds[0][1] + 20) +">Proportion : " +
		value[0]["Proportion de la population en %"] +
		"% </tspan><tspan x=" + bounds[0][0] + " y="+ (bounds[0][1] + 40) +">  n : " +
		value[0]["n"]  + "</tspan>"
			);
  else
	popup.html(
		"" +
		canton +
		"<tspan x=" + bounds[0][0] +" y=" + (bounds[0][1] + 20) +">Il n'y a pas assez de données</tspan>");
}

function handleMouseout(e, d) {
	  // hide popup	
	  d3.select("#popup text").html("");

	
}

d3.select("#year").on("change", function () {
  let value = d3.select(this).property("value");
  year = value;
  datapath =
    "./datasets/Cannabis_map_dataset/" +
    year +
	"-"+
	type +
    ".csv";
  showData();
});

d3.select("#gender").on("change", function () {
  let value = d3.select(this).property("value");
  gender = value;
  showData();
});

d3.select("#type").on("change", function () {
  let value = d3.select(this).property("value");
  type = value;
  datapath =
    "./datasets/Cannabis_map_dataset/" +
    year +
	"-"+
	type +
    ".csv";
  showData();
});

function showData() {
  //show data on map
  d3.csv(datapath).then(function (data) {
	currentMapData = data;
    let map = d3.select("g.map");
    let paths = map.selectAll("path");
    paths.each(function (d) {
      let canton = d.properties.name;
      let value = data.filter(function (row) {
        return row.canton == canton && row.Gender == gender;
      });
      if (value && value[0]["Proportion de la population en %"] != ".") {
        d3.select(this).attr("fill", function () {
          let color = d3
            .scaleLinear()
            .domain([0, 13])
            .range(["#fff", BASECOLOR]);
          return color(value[0]["Proportion de la population en %"]);
        });
      } else {
        d3.select(this).attr("fill", "#fff");
      }
    });
  });

  //show data on bar chart
  //https://d3-graph-gallery.com/graph/barplot_button_data_csv.html
  showDataGraph("./datasets/Cannabis_graph_dataset/" + year + ".csv", ".cannabisForm", "Niveau de formation");
  showDataGraph("./datasets/Cannabis_graph_dataset/" + year + ".csv", ".cannabisRegion", "Région linguistique");
  showDataGraph("./datasets/Other_graph_dataset/" + year + ".csv", ".otherForm", "Niveau de formation");
  showDataGraph("./datasets/Other_graph_dataset/" + year + ".csv", ".otherRegion", "Région linguistique");
}

function showDataGraph(dataPath, svgClass, defName) {
	
  let margin = { top: 10, right: 30, bottom: 30, left: 60 };
  let width = 400 - margin.left - margin.right;
  let height = 150 - margin.top - margin.bottom;

  d3.select(svgClass).selectAll("svg").remove();

  let svg = d3.select(svgClass)
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  let x = d3.scaleBand().range([0, width]).padding(0.1);
  let y = d3.scaleLinear().range([height, 0]);
  svg.append("g")
 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let xAxis = svg.append("g")
	.attr("transform", "translate(0," + height + ")")

  let yAxis = svg.append("g")
	.attr("class", "myYaxis")

  d3.csv(dataPath).then(function (data) {

	dataChart = data.filter(function (col) {
		return col["Def"] == defName && col['Gender'] == gender;
	});
	x.domain(dataChart.map(function (d) { return d["Nom"]; }));
	xAxis.transition().duration(1000).call(d3.axisBottom(x))

	y.domain([0, d3.max(dataChart, function (d) { return +d["Proportion de la population en %"] + 2; })]);
	yAxis.transition().duration(1000).call(d3.axisLeft(y));

	let u = svg.selectAll("rect")
		.data(dataChart)

	u.enter()
		.append("rect")
		.merge(u)
		.transition()
		.duration(1000)
			.attr("x", function (d) { return x(d["Nom"]); })
			.attr("y", function (d) { return y(d["Proportion de la population en %"]); })
			.attr("width", x.bandwidth())
			.attr("height", function (d) { return height - y(d["Proportion de la population en %"]); })
			.attr("fill", "#fff")
      .attr("stroke", "#000")

  //add value on bar
  svg.selectAll(".text")
  .data(dataChart)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", (function (d) { return x(d["Nom"]) + x.bandwidth() / 2; }))
  .attr("y", function (d) { return y(d["Proportion de la population en %"]) - 15 ; })
  .attr("dy", ".75em")
  .text(function (d) { return d["Proportion de la population en %"] + "%"; })
  .attr("fill", "#000")
  .attr("text-anchor", "middle");

      
  });
}

function update(geojson) {
  let u = d3.select("content g.map").selectAll("path").data(geojson.features);

  u.enter()
    .append("path")
    .attr("d", geoGenerator)
    .on("mouseover", handleMouseover)
	.on("mouseout", handleMouseout);
}

// REQUEST DATA
d3.json("./datasets/switzerland-with-regions.geojson").then(function (json) {
  update(json);
  showData();
});

//map legend
//https://d3-graph-gallery.com/graph/custom_legend.html
let svg = d3.select("svg");
const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

let legend = svg
  .append("g")
  .attr("class", "legend")
  .attr("transform", "translate(20,20)");

let legendRect = legend
  .append("rect")
  .attr("width", 200)
  .attr("height", 100)
  .attr("fill", "white")
  .attr("opacity", 0.5);

let legendText = legend
  .append("text")
  .attr("x", 10)
  .attr("y", 20)
  .attr("font-size", 12)
  .attr("font-weight", "bold")
  .text("Légende");

let legendColors = legend
  .selectAll("rect.legend-color")
  .data(keys)
  .enter()
  .append("rect")
  .attr("class", "legend-color")
  .attr("x", 10)
  .attr("y", function (d, i) {
    return 30 + i * 10;
  })
  .attr("width", 10)
  .attr("height", 10)
  .attr("fill", function (d) {
    let color = d3.scaleLinear().domain([0, 11]).range(["#fff", BASECOLOR]);
    return color(d);
  });

let legendLabels = legend
  .selectAll("text.legend-label")
  .data(keys)
  .enter()
  .append("text")
  .attr("class", "legend-label")
  .attr("x", 25)
  .attr("y", function (d, i) {
    return 40 + i * 10;
  })
  .attr("font-size", 10)
  .text(function (d) {
    return d + " %";
  });
