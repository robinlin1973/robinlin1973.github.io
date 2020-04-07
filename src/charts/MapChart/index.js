import React from 'react';
import { scaleQuantize } from '@vx/scale';
import { GradientTealBlue, LinearGradient } from '@vx/gradient';
import { Mercator,Graticule } from '@vx/geo';
import * as topojson from 'topojson-client';
import topology from '../../data/world-topo.json';
import * as d3 from 'd3';
import rawdata from '../../data/covid.csv';


function showDetail(countryName){

    d3.csv(rawdata, function(rawdata) {

      var casesByCountry = d3.nest()
          .key(function(d) { return d.country; })
//          .key(function(d) { return d.province; })
          .entries(rawdata);
      var countrydata = casesByCountry.filter(e=>e.key.includes(countryName));
      if(countrydata.length === 1) {

          if(countrydata[0].values.length>0 <=0) return null;
          var data = countrydata[0].values;
//          var latest = data.reduce(function(a,b){
//              // Turn your strings into dates, and then subtract them
//              // to get a value that is either negative, positive, or zero.
//              var adate = new Date(a.update);
//              var bdate = new Date(b.update);
//              return adate > bdate ?a:b;
//          });
          var latest = d3.nest()
          .key(function(d) { return d.update; })
          .entries(data);
          console.log(latest);

//        alert("summary of "+countryName+" deaths:"+data[0].deaths+" confirmed:"+data[0].confirmed+"recovered:"+ data[0].recovered);

      }else{

          return null;
      }

    });


}

export default ({ width, height, events = false }) => {
  if (width < 10) return <div />;

  const world = topojson.feature(topology, topology.objects.units);

  const color = scaleQuantize({
    domain: [
      Math.min(
        ...world.features.map(f => f.geometry.coordinates.length),
      ),
      Math.max(
        ...world.features.map(f => f.geometry.coordinates.length),
      ),
    ],
    range: [
      '#ffb01d',
      '#ffa020',
      '#ff9221',
      '#ff8424',
      '#ff7425',
      '#fc5e2f',
      '#f94b3a',
      '#f63a48',
    ],
  });

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = width / 630 * 100;
    const bg = '#f9f7e8';
    const bg2 = '#09f7e8';



  return (
    <svg width={width} height={height}>
      <LinearGradient id="geo_mercator_radial"
        from="#dc22af"
        to="#fd7e0f"
        r={'80%'}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={`#f9f7e8`}
        rx={14}
      />

      <Mercator data={world.features} scale={scale} translate={[centerX, centerY + 50]}>
          {mercator => {
            return (
              <g>
                <Graticule graticule={g => mercator.path(g)} stroke={'rgba(33,33,33,0.05)'} />
                {mercator.features.map((feature, i) => {
                  const { feature: f } = feature;
                  return (
                    <path
                      key={`map-feature-${i}`}
                      d={mercator.path(f)}
                      fill={color(f.geometry.coordinates.length)}
                      stroke={bg}
                      strokeWidth={0.5}
                      onClick={event => {
                      let el = event.target;
//                      alert(`clicked: ${} (${f.id})`);
                      showDetail(f.properties.name);
                      el.style.stroke=bg2;
                      }}
                    />
                  );
                })}
              </g>
            );
          }}
        </Mercator>
    </svg>
  );
};
