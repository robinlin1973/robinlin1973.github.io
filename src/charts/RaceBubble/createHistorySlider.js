import {range, min, max} from 'd3-array'
import {timeFormat} from 'd3-time-format'
import {select} from 'd3-selection'
import * as moment from 'moment'
import * as d3 from 'd3';

import * as simple_slider from 'd3-simple-slider'

let dateValue = 0


function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('%m/%d/%Y') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    console.log(dateArray);
    return dateArray;
}

function createHistorySlider(node, width, height, start,end, callBackFunction){

    console.log(node, width, height, start,end, callBackFunction);
    var margin = {
        left: 10,
        right:10,
        top: 10,
        bottom: 10
    }
    start = parseInt(start);
    end=parseInt(end);
    var data = d3.timeYears(start, end);

    var slider = simple_slider.sliderHorizontal()
                   .min(start)
                   .max(end)
                   .step(1)
                   .width(width)
//                   .tickFormat(timeFormat('%m/%d/'))
                   .tickValues(data)
                   .on('onchange', (val) => changeDateValue(val))



    var group = select(node).append("svg")
                   .attr("width", width)
                   .attr("height", height)
                   .append("g")
                   .attr("transform", "translate(30, 30)")
                   .call(slider);
    return slider;
    function changeDateValue(date){
        callBackFunction(date)
    }

}

export {createHistorySlider};
