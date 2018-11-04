import * as d3B from "d3"
import * as d3Select from 'd3-selection'
import * as topojson from "topojson"
import * as d3GeoProjection from "d3-geo-projection"

const d3 = Object.assign({}, d3B, d3Select, topojson, d3GeoProjection);

const map = "<%= path %>/assets/world-110m.json";
const subscribers = "<%= path %>/assets/subscribers.csv";

let width = 860,
height = 500;

let padding = 3;

var projection = d3.geoCylindricalStereographic()

let path = d3.geoPath(projection);

let radius = d3.scaleSqrt()
.range([0, 50]);

Promise.all([
  d3.json(map),
  d3.csv(subscribers)
  ])
.then(ready)

function ready(data) {

	let world = data[0];
  let neighbors = topojson.neighbors(world.objects.countries.geometries);

  let countries = topojson.feature(world, world.objects.land);
  projection.fitSize([width, height], countries);
  let mesh = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; })

  let subscribers = data[1];
  let keys = Object.keys(subscribers[0]);

  let totals = keys.filter(k => k.indexOf("total") != -1);

  let values = []

  subscribers.forEach(s => {
    totals.forEach(t => {
      values.push(+s[t])
    })
  })

  radius
  .domain([0, d3.max(values)])

  totals.forEach(t => {
    let mapWrapper = d3.select(".maps-wrapper")
    .append('div')
    .attr("class", "map-wrapper " + t.replace(" ", "-"))

    mapWrapper
    .append('div')
    .html(t.replace("total ", ""))

    let svg = mapWrapper
    .append("svg")
    .attr("width", width)
    .attr("height", height)

    makeMap(svg, countries, mesh)
    makeBubbles(svg, subscribers, t)
  })

  let nodes = subscribers.map(d => {
    let point = projection([d.longitude, d.latitude]);
    let value = 0;
    if(!isNaN(+d['total 2018']))
    {
      value = +d['total 2018'];
    }
    
    return {
      continet:d.continet.replace(" ", "-"),
      country:d.country.replace(" ", "-"),
      x: point[0], y: point[1],
      x0: point[0], y0: point[1],
      r: radius(value),
      value: value
    }
  })

  let simulation = d3.forceSimulation()
  .force("x", d3.forceX(function(d) { return d.x0; }))
  .force("y", d3.forceY(function(d) { return d.y0; }))
  .force("collide", collide)
  .nodes(nodes)
  .on("tick", tick);

  let node = d3.select('.maps-wrapper').append('svg').attr("width", width).attr("height", height)
  .selectAll("rect")
  .data(nodes)
  .enter()
  .append("rect")
  .attr("class", d => d.continet + " " + d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  function tick(e) {
    node
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; });
  }

  function collide() {
  for (var k = 0, iterations = 1, strength = 0.5; k < iterations; ++k) {
    for (var i = 0, n = nodes.length; i < n; ++i) {
      for (var a = nodes[i], j = i + 1; j < n; ++j) {
        var b = nodes[j],
        x = a.x + a.vx - b.x - b.vx,
        y = a.y + a.vy - b.y - b.vy,
        lx = Math.abs(x),
        ly = Math.abs(y),
        r = a.r + b.r + padding;
        if (lx < r && ly < r) {
          if (lx > ly) {
            lx = (lx - r) * (x < 0 ? - strength : strength);
            a.vx -= lx, b.vx += lx;
          } else {
            ly = (ly - r) * (y < 0 ? - strength : strength);
            a.vy -= ly, b.vy += ly;
          }
        }
      }
    }
  }
}

}







function makeMap(wrapper, countries, mesh){

  wrapper.insert("path", ".graticule")
  .datum(countries)
  .attr("class", "land")
  .attr("d", path)

  wrapper.insert("path", ".graticule")
  .datum(mesh)
  .attr("class", "boundary")
  .attr("clip-path", "url(#clip)")
  .attr("d", path);
}

function makeBubbles(wrapper, data, year){
  wrapper.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d => projection([d.longitude, d.latitude])[0])
  .attr("cy", d => projection([d.longitude, d.latitude])[1])
  .attr("r", d => radius(d[year]))
  .attr("class", d => d.country.replace(" ", "-") + " " + d.continet.replace(" ", "-"))
  .attr("fill", "red")
  .attr("stroke", "white")
  .attr("opacity", .5)
}


