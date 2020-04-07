import React, { Component } from 'react';
import { List } from 'antd';
import './view6.css';
import RaceBubble from '../../charts/RaceBubble';

export default class View6 extends Component {

    selectUser = (user) => {
        this.props.changeSelectUser(user);
    }

    render() {
        const {data} = this.props;
        return (
            <div id='view6' className='pane'>
                <div style={{ overflowX: 'scroll',overflowY:'scroll' }}>
                        <svg width="960" height="500">
                            <RaceBubble width={960} height={500} data={data}/>
                        </svg>
                </div>
            </div>
        )
    }
}
