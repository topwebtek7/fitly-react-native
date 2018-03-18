import React, { Component } from 'react';
import { TouchableHighlight, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { optionStyle, container } from '../styles/styles.js'
import Icon from 'react-native-vector-icons/Ionicons';

export const Entry = (props) => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={[optionStyle.entry, {minHeight: 40}]}>
        <Text style={optionStyle.label}>{props.text}</Text>
        {(props.icon) ? <Icon style={{right: 22}} name={props.icon} size={40} color="#bbb"/> : null}
        {props.children}
      </View>
    </TouchableOpacity>
  )
};

export const Separator = (props) => {
  return (
    <View style={{height: 25, backgroundColor: '#eee', justifyContent:'center', borderColor:'#ddd', borderTopWidth: .5, borderBottomWidth: .5}}>
      {(props.text)
        ? <Text style={{textAlign:'center', color: '#aaa'}}>{props.text}</Text>
        : null
      }
    </View>
  )
};
