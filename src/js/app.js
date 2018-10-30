import * as d3B from "d3"
import * as d3Select from 'd3-selection'
import * as topojson from "topojson"
import * as d3GeoProjection from "d3-geo-projection"

const d3 = Object.assign({}, d3B, d3Select, topojson, d3GeoProjection);

const map = "<%= path %>/assets/world-110m.json";
const subscribers = "<%= path %>/assets/subscribers.csv";

var width = 960,
    height = 500;

var projection = d3.geoWinkel3()
					.center([0, 0])
  					.translate([width / 2, height / 2])
  					.scale(200)

var path = d3.geoPath(projection);

var graticule = d3.geoGraticule();

var svg = d3.select(".maps-wrapper").append("svg")
    .attr("width", width)
    .attr("height", height);
svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);
svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");
svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");
svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);


Promise.all([
  d3.json(map),
  d3.csv(subscribers)
  ])
.then(ready)

function ready(data) {

	let world = data[0];
	let subscribers = data[1];

	svg.insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

    svg.selectAll("circle")
    .data(subscribers)
    .enter()
    .append("circle")
    .attr("cx", d => projection([d.longitude, d.latitude])[0])
    .attr("cy", d => projection([d.longitude, d.latitude])[1])
    .attr("r", d => Math.sqrt(d["total 2018"]) / 50)
    .attr("fill", "red")
    .attr("opacity", .5)
}
  
  

