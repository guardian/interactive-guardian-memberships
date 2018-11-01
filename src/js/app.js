import * as d3B from "d3"
import * as d3Select from 'd3-selection'
import * as topojson from "topojson"
import * as d3GeoProjection from "d3-geo-projection"

const d3 = Object.assign({}, d3B, d3Select, topojson, d3GeoProjection);

const map = "<%= path %>/assets/world-110m_2.json";
const subscribers = "<%= path %>/assets/subscribers.csv";

let width = window.innerWidth;
let height;

let isMobile = window.matchMedia('(max-width: 620px)').matches;

if(!isMobile)
{
  height = 752 * width / 1260;
}
else
{
  height = 500 * width / 300;
}

let padding = 1;

const cartogram = d3.select('.maps-wrapper')
.append('svg')
.attr("width", width)
.attr("height", height);

const bubbleMap = d3.select('.maps-wrapper')
.append('svg')
.attr("width", width)
.attr("height", height);

let projection = d3.geoMercator()
    .scale(250)
    .translate([width / 2, height / 2])
    .precision(.1)
    .center([20, 43]);

let path = d3.geoPath(projection);

let radius = d3.scaleSqrt()
.range([0, 80]);

Promise.all([
  d3.json(map),
  d3.csv(subscribers)
  ])
.then(ready)

function ready(data) {

	let world = data[0];

  let countries = topojson.feature(world, world.objects.world110m);

  world.filter(d => console.log(d))

  //console.log(countries)
  projection.fitSize([width, height], countries);
  //let mesh = topojson.mesh(world, world.objects["world-110m"], function(a, b) { return a !== b; })

  let subscribers = data[1];
  let keys = Object.keys(subscribers[0]);

  let totals = keys.filter(k => k.indexOf("total") != -1);

  let maxValue = d3.max(keys.map( k => {
    if(k.indexOf("total ") != -1)
    {
      return d3.max(subscribers.map(n => +n[k]))
    }
  }));
  
  radius
  .domain([0, maxValue])

  let nodes = [];

  totals.forEach(t => {
    subscribers.map(d => {
      let point = projection([d.longitude, d.latitude]);
      let value = 0;

      if(!isNaN(+d[t]))
      {
        value = +d[t];
      }
      nodes.push( {
        continent:d.continent.replace(" ", "-"),
        country:d.country.replace(" ", "-"),
        x: point[0], y: point[1],
        x0: point[0], y0: point[1],
        r: radius(value),
        value: value,
        year: t
      }
      )
    })
  })

  let currentNodes = nodes.filter(n => n.year == "total 2018")

  /*makeMap(bubbleMap, countries, mesh)
  makeBubbles(bubbleMap, currentNodes)*/

  let northAmerica = cartogram
  .append("g")
  .selectAll("rect")
  .data(currentNodes)
  .enter()
  .filter(d => d.continent == "North-America")
  .append("rect")
  .attr("class", d => d.continent + " " + d.country)
  .attr("id", d => d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  let southAmerica = cartogram
  .append("g")
  .selectAll("rect")
  .data(currentNodes)
  .enter()
  .filter(d => d.continent == "South-America")
  .append("rect")
  .attr("class", d => d.continent + " " + d.country)
  .attr("id", d => d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  let europe = cartogram
  .append("g")
  .selectAll("rect")
  .data(currentNodes)
  .enter()
  .filter(d => d.continent == "Europe")
  .append("rect")
  .attr("class", d => d.continent + " " + d.country)
  .attr("id", d => d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  let africa = cartogram
  .append("g")
  .selectAll("rect")
  .data(currentNodes)
  .enter()
  .filter(d => d.continent == "Africa")
  .append("rect")
  .attr("class", d => d.continent + " " + d.country)
  .attr("id", d => d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  let asia = cartogram
  .append("g")
  .selectAll("rect")
  .data(currentNodes)
  .enter()
  .filter(d => d.continent == "Asia")
  .append("rect")
  .attr("class", d => d.continent + " " + d.country)
  .attr("id", d => d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  let oceania = cartogram
  .append("g")
  .selectAll("rect")
  .data(currentNodes)
  .enter()
  .filter(d => d.continent == "Oceania")
  .append("rect")
  .attr("class", d => d.continent + " " + d.country)
  .attr("id", d => d.country)
  .attr("width", function(d) { return d.r * 2; })
  .attr("height", function(d) { return d.r * 2; });

  let simulation = d3.forceSimulation()
  .force("x", d3.forceX(function(d) { return d.x0; }))
  .force("y", d3.forceY(function(d) { return d.y0; }))
  .force("collide", c => {collide(currentNodes)})
  .nodes(currentNodes)
  .on("tick", t => {
    northAmerica
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; })

    southAmerica
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; })

    europe
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; })

    africa
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; })

     asia
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; })

     oceania
    .attr("x", function(d) { return d.x - d.r; })
    .attr("y", function(d) { return d.y - d.r; })
  });

}

function collide(nodes) {

  let iterations = 5;
  let strength = 0.05;

  for (let i = 0; i < iterations; ++i) {

    let n = nodes.length;

    for (let j = 0; j < n; ++j) {

      for (let k = j + 1; k < n; ++k) {

        let a = nodes[k]
        let b = nodes[j]
        let x = a.x + a.vx - b.x - b.vx
        let y = a.y + a.vy - b.y - b.vy
        let lx = Math.abs(x)
        let ly = Math.abs(y)
        let r = a.r + b.r + padding;

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
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", d => d.r)
  .attr("class", d => d.continent + " " + d.country)
  .attr("fill", "red")
  .attr("stroke", "white")
  .attr("opacity", .5)
}


