import React, {Component} from 'react';
// import queue from 'queue';
// import topojson from 'topojson';
// import all of topojson?????
import * as topojson from 'topojson';
import * as d3 from 'd3';
import {findCountryData} from '../util.js';
import {createHistorySlider} from './createHistorySlider.js';
import world from '../../data/world-topo.json';
//import world from '../../data/countries_geo.json';
import { timeParse, timeFormat } from 'd3-time-format';

class CoronaBubble extends Component {
    state = {
//        worldData: world,
        date:'03/24/2020',
        datatype:'deaths',
    };

    drawmap()
    {
        console.log("CoronaBubble:drawmap");
        const svg = d3.select(this.refs.anchor),{ width, height,data } = this.props;
        const projection = d3.geoMercator().scale(1).translate([0, 0]);
        const path = d3.geoPath(projection);
        const date = this.state.date;
        const groups = ['country', 'date'];
        var grouped = {};
        const format = timeFormat('%m/%d/%Y');
        var timer = null;
        var isPlaying = false;

        var slider = createHistorySlider(
            '#dateslider',width-150,80,'01/22/2020',this.state.date,(date)=>{
                const d = format(date);

                this.setState({
                    date:d,
                })
        });

        d3.select("#play")
              .attr("title","Play animation")
              .on("click",function(){
                if ( !isPlaying ){
                  d3.select(this).classed("pause",true).attr("title","Pause animation");
                  timer = setInterval(step, 100);
//                  isPlaying = true;
                } else {
                  clearInterval(timer);
                  d3.select(this).classed("pause",false).attr("title","Play animation");
//                  isPlaying = false;
                }
              });

        data.forEach(function (a) {
            groups.reduce(function (o, g, i) {  // take existing object,
                o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {}); // or generate new obj, or
                return o[a[g]];                                           // at last, then an array
            }, grouped).push(a);
        });



        const g = svg.append( "g" ).attr("id","worldgroup");
//        console.log(world.features.length,  Object.keys(world.features[0]));
//        var selectedcountry = world.features.filter((d)=>{return d.properties.ADMIN=='China';});
//        console.log(selectedcountry);

        var b = path.bounds(world),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection.scale(s)
            .translate(t);


        g.selectAll("path .worldpath")
          .data(topojson.feature(world, world.objects.units).features)
           .enter().append("path")
            .attr("fill", '#eaedff')
            .attr("class","worldpath")
            .attr("stroke", "black")
            .attr("stroke-linejoin", "round")
            .attr("d", path)
            .append("title")
              .text(d => d.properties['name']);

        var zoom = d3.zoom()
              .scaleExtent([1, 18])
              .on('zoom', function() {
                  g.selectAll('path')
                   .attr('transform', d3.event.transform);
        });

        svg.call(zoom);





        function step(){
            var currentdate = new Date(slider.value());
            var maxdate= new Date(slider.max());
            var mindate= new Date(slider.min());

            if(currentdate < maxdate){
                currentdate.setDate(currentdate.getDate() + 1);
                const startdate = format(currentdate);
            }else{
                currentdate = mindate;
                clearInterval(timer);
                d3.select("#play").classed("pause",false).attr("title","Play animation");
            }
            slider.value(currentdate);
        }
//
//        d3.select('#datatype').on('change',()=>{
//            var e = document.getElementById("datatype")
//            this.setState({datatype:e.options[e.selectedIndex].text});
////            console.log(e.options[e.selectedIndex] );
//        });
    }//drawmap


    drawbubble(){
        console.log("CoronaBubble:drawbubble");
        const svg = d3.select(this.refs.anchor),
        { width, height,data } = this.props;
//        const world = this.state.worldData;
        const groups = ['country', 'date'];
        const projection = d3.geoMercator();
        var grouped = {};

        data.forEach(function (a) {
            groups.reduce(function (o, g, i) {  // take existing object,
                o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {}); // or generate new obj, or
                return o[a[g]];                                           // at last, then an array
            }, grouped).push(a);
        });

        const color={
                        "deaths":'#ff8424',
                        "active":'#efb01d',
                        "recovered":'#a44afe'
                    };

        svg.selectAll(".worldcircle").remove();
        svg.selectAll(".worldcircle")
          .data(topojson.feature(world, world.objects.units).features)
//          .data(world.features)
          .enter()
          .append("circle")
          .attr("r",(d)=>{
                var country = d.properties['name'];
                return Math.sqrt(findCountryData(grouped,country,this.state.date,this.state.datatype))/2;
            })
          .attr("fill",color[this.state.datatype])
          .style("opacity", 0.2)
          .attr("class","worldcircle")
          .attr("transform",function(d){
            var p = projection(d3.geoCentroid(d)); //<-- centroid is the center of the path, projection maps it to pixel positions
            return "translate("+p+")";
          });

    }//drawbubble

    componentDidMount() {
        console.log("CoronaBubble:componentDidMount")
        this.drawmap();
//        this.drawbubble();

    }

    componentDidUpdate() {
        console.log("CoronaBubble:componentDidUpdate");
//        this.drawbubble();
    }

    render() {
        console.log("CoronaBubble:render");
//        const { worldData }  = this.state;

//        if(!world) {return null}


        return <g ref="anchor" />;
    }
}

export default CoronaBubble;
