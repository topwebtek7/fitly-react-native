/**
 * @flow
 */

import React, { Component } from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import { headerStyle, FitlyBlue } from '../styles/styles.js';
import { push, pop } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const btnStyle = {
  borderRadius: 2,
  backgroundColor: FitlyBlue,
  width: 120,
  height: 40,
  justifyContent: 'center',
  alignSelf: 'flex-end',
  margin: 10,
  shadowColor: "black",
  shadowOpacity: .6,
  elevation: 2,
  shadowOffset: {width: 0, height: 0},
  shadowRadius: 2,
}

class Btn extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let style = Object.assign({}, btnStyle, this.props.style)
    let textStyle = Object.assign({}, {color: 'white', textAlign: 'center'}, this.props.textStyle)
    return (
      <TouchableHighlight style={style} onPress={() => this.props.onPress()}>
        <Text style={textStyle}>
          {this.props.text}
        </Text>
      </TouchableHighlight>
    )
   }
 };

 const mapStateToProps = function(state) {
  return {
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    navigation: bindActionCreators({ push, pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Btn);
