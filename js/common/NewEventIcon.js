import React, { Component } from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

export default class NewEventIcon extends Component {

  render(){
    return (
      <View>
        <Icon name='ios-calendar-outline' size={this.props.iconSize} color={this.props.color}/>
        <View style={{position: 'absolute', bottom: 2, right: 3, zIndex: 95, backgroundColor: 'transparent'}}>
          <Icon name="ios-add-outline" size={20} color={'white'}/>
        </View>
      </View>
    )
  }
}
