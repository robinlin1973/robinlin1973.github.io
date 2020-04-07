import React, {Component} from 'react';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import {findCountryData} from '../util.js';
import world from '../../data/world-topo.json';
import { timeParse, timeFormat} from 'd3-time-format';
import {Scrubber,disposal, valueAt, dataAt} from './helper.js';
import data from './nations.json';
import * as simple_slider from 'd3-simple-slider';
import { sliderBottom } from 'd3-simple-slider';
import {createHistorySlider} from './createHistorySlider.js';


class RaceBubble extends Component {
    state = {
        year:1880,
    };

    circle = null;

    draw()
    {
        console.log("RaceBubble:drawmap");
        const {width,height}= this.props;
        const margin = ({top: 20, right: 20, bottom: 35, left: 40});

        console.log(data);
        const x = d3.scaleLog([200, 1e5], [margin.left, width - margin.right]);
        const y = d3.scaleLinear([14, 86], [height - margin.bottom, margin.top]);
        const radius = d3.scaleSqrt([0, 5e8], [0, width / 24]);
        const color = d3.scaleOrdinal(data.map(d => d.region), d3.schemeCategory10).unknown("black");
        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80, ","))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", width)
                .attr("y", margin.bottom - 4)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text("Income per capita (dollars) →"));

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", -margin.left)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Life expectancy (years)"));

        const grid = g => g
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .call(g => g.append("g")
              .selectAll("line")
              .data(x.ticks())
              .enter().append("line")
                .attr("x1", d => 0.5 + x(d))
                .attr("x2", d => 0.5 + x(d))
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom))
            .call(g => g.append("g")
              .selectAll("line")
              .data(y.ticks())
              .enter().append("line")
                .attr("y1", d => 0.5 + y(d))
                .attr("y2", d => 0.5 + y(d))
                .attr("x1", margin.left)
                .attr("x2", width - margin.right));
        const currentData = dataAt(data,this.state.year);
        console.log(this.state.year);

        const svg = d3.select(this.refs.anchor);

        const chart = svg.append("g")
              .call(xAxis);

          svg.append("g")
              .call(yAxis);

          svg.append("g")
              .call(grid);

          this.circle = svg.append("g")
              .attr("stroke", "black")
            .selectAll("circle")
            .data(currentData, d => d.name)
            .join("circle")
              .sort((a, b) => d3.descending(a.population, b.population))
              .attr("cx", d => x(d.income))
              .attr("cy", d => y(d.lifeExpectancy))
              .attr("r", d => radius(d.population))
              .attr("fill", d => color(d.region))
              .call(circle => circle.append("title")
                .text(d => [d.name, d.region].join("\n")));

    }//drawmap

    drawSlider(){
        var timer = null;
        var isPlaying = false;


                // Time
        var slider = createHistorySlider(
        '#yearslider',800,80,1880,2008,(value)=>{
                this.setState({year:value});
        });

        d3.select("#yearplay")
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

        function step(){
            var currentyear = slider.value();
            var maxyear= slider.max();
            var minyear= slider.min();

            if(currentyear < maxyear){
                currentyear++;
            }else{
                currentyear = minyear;
                clearInterval(timer);
                d3.select("#yearplay").classed("pause",false).attr("title","Play animation");
            }
            slider.value(currentyear);
        }
    }


    componentDidMount() {
        console.log("RaceBubble:componentDidMount")
        this.draw();
        this.drawSlider();
    }

    componentDidUpdate() {
        console.log("RaceBubble:componentDidUpdate");
        d3.selectAll('circle').remove();
        this.draw();

    }

    render() {
        console.log("RaceBubble:render");

        return (<svg>
                <g ref="anchor" />;
                <div class="row align-items-center">
                <div class="col-sm-2"><p id="value-time"></p></div>
                <div class="col-sm"><div id="slider-time"></div></div>
                </div>
            </svg>
            );
    }
}

export default RaceBubble;
