import React, { Component } from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default class RunningManIcon extends Component {

  render(){
    return (
      <Icon name='directions-run' size={this.props.iconSize + 5} color={this.props.color}/>
    )
  }
}
