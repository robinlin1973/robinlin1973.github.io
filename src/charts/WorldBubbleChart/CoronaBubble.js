import React, {Component} from 'react';
// import queue from 'queue';
// import topojson from 'topojson';
// import all of topojson?????
import * as topojson from 'topojson';
import * as d3 from 'd3';
import {findCountryData} from './util.js';
import {createHistorySlider} from './createHistorySlider.js';
import world from './data/world-topo.json';
import { timeParse, timeFormat } from 'd3-time-format';

class CoronaBubble extends Component {
    state = {
        worldData: world,
        date:'03/18/2020',
        datatype:'deaths',
    };

    drawsvg()
    {
//        console.log("drawsvg");
        const svg = d3.select(this.refs.anchor),{ width, height,data } = this.props;
        const projection = d3.geoMercator();
        const path = d3.geoPath(projection);
        const world = this.state.worldData;
        const date = this.state.date;
        const groups = ['country', 'date'];
        var grouped = {};
        const format = timeFormat('%m/%d/%Y');
        var timer = null;
        var isPlaying = false;

        var slider = createHistorySlider(
            '#dateslider',800,80,'01/22/2020',this.state.date,(date)=>{
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

        d3.select('#datatype').on('change',()=>{
            var e = document.getElementById("datatype")
            this.setState({datatype:e.options[e.selectedIndex].text});
//            console.log(e.options[e.selectedIndex] );
        });

}
d
    componentDidMount() {
//        console.log("componentDidMount")
        this.drawsvg();
    }

    componentDidUpdate() {
        console.log("componentDidUpdate");

        const svg = d3.select(this.refs.anchor),
            { width, height,data } = this.props;
        const world = this.state.worldData;
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
                        "hospitalized":'#efb01d',
                        "recovered":'#a44afe'
                    };

        svg.selectAll(".worldcircle").remove();
        svg.selectAll(".worldcircle")
          .data(topojson.feature(world, world.objects.units).features)
          .enter()
          .append("circle")
          .attr("r",(d)=>{
                var country = d.properties['name'];
//                console.log(country,Math.sqrt(findCountryData(grouped,country,this.state.date,this.state.datatype)));
                return Math.cbrt(findCountryData(grouped,country,this.state.date)[this.state.datatype]);
            })
          .attr("fill",color[this.state.datatype])
          .style("opacity", 0.2)
          .attr("class","worldcircle")
          .attr("transform",function(d){
            var p = projection(d3.geoCentroid(d)); //<-- centroid is the center of the path, projection maps it to pixel positions
            return "translate("+p+")";
          });

    }

    render() {
//        console.log("render");
        const { worldData }  = this.state;

        if(!worldData) {
            return null
        }


        return <g ref="anchor" />;
    }
}

export default CoronaBubble;
