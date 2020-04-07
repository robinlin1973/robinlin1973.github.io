import React, { Component } from 'react';
//import MapChart from '../../charts/MapChart';
import CoronaLine from '../../charts/RaceLine';

import './view3.css';

export default class View3 extends Component {
    render() {
        const {data,selectedCountry} = this.props;
        console.log("view3",this.props.selectedCountry);
        return (
            <div id='view3' className='pane'>
                <div style={{ overflowX: 'scroll',overflowY:'hidden' }}>
                        <svg id="linesvg" width={900} height={300} selectedCountry={selectedCountry}>
                            <CoronaLine width={900} height={300} data={data} selectedCountry={selectedCountry}/>
                        </svg>
                </div>
            </div>
        )
    }
}
