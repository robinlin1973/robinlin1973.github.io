import React, { Component } from 'react';
//import MapChart from '../../charts/MapChart';
import CoronaLine from '../../charts/RaceLine';

import './view8.css';

export default class View8 extends Component {
    render() {
        const {data} = this.props;
//        console.log("view8",data);
        return (
            <div id='view8' className='pane'>
                <div style={{ overflowX: 'scroll',overflowY:'hidden' }}>
                        <svg id="linesvg" width={800} height={300}>
                            <CoronaLine width={800} height={300} data={data}/>
                        </svg>
                </div>
            </div>
        )
    }
}
