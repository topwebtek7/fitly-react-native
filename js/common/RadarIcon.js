import React, { Component } from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default class RadarIcon extends Component {

  render(){
    return (
      <Icon name='adjust' size={this.props.iconSize} color={this.props.color}/>
    )
  }
}
