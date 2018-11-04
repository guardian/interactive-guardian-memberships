import * as d3B from "d3"
import * as d3Select from 'd3-selection'
import * as topojson from "topojson"
import * as d3GeoProjection from "d3-geo-projection"



function jsonGenerator()
{

const d3 = Object.assign({}, d3B, d3Select, topojson, d3GeoProjection);

const map = "<%= path %>/assets/ne_10m_admin_0_countries.json";
const csv = "<%= path %>/assets/subscribers.csv";

const json = {"nodes": [], "links": []}

let projection = d3.geoMercator();

let path = d3.geoPath()
          .projection(projection)

Promise.all([
  d3.json(map),
  d3.csv(csv)
  ])
.then(ready)

function ready(data) {

  let world = data[0];
  let subscribers = data[1];

  let worldFeatures = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;

  let neighbors = topojson.neighbors( world.objects.ne_10m_admin_0_countries.geometries);

  worldFeatures.map((f,i) => {

    let centroid = projection.invert(path.centroid(f));

    json.nodes.push({
      continent:f.properties.CONTINENT,
      country:f.properties.NAME,
      code:f.properties.ISO_A3,
      lat:centroid[0],
      lon:centroid[1],
      subscribers:[
        {year:2015, subs:0},
        {year:2016, subs:0},
        {year:2017, subs:0},
        {year:2018, subs:0}
      ]
    })

    neighbors[i].map(n => json.links.push
      ({
        source:f.properties.ISO_A3,
        target:worldFeatures[n].properties.ISO_A3
      })
    )
  })

  subscribers.map(s => {
    let node = json.nodes.find( j => j.code == s.code);

    if(node)
    {
      node.subscribers[0].subs = +s["total 2015"];
      node.subscribers[1].subs = +s["total 2016"];
      node.subscribers[2].subs = +s["total 2017"];
      node.subscribers[3].subs = +s["total 2018"];
    }
    
  })

  let myJSON = JSON.stringify(json);

  d3.select(".interactive-wrapper").html(myJSON)
}

}

export { jsonGenerator }