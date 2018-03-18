import React, { Component } from 'react';
import { View, Text, TouchableHighlight, Slider } from 'react-native';
import { loginStylesInverse, commonStyle } from '../../styles/styles.js';
import { pop, push, resetTo } from '../../actions/navigation.js';
import { setActivityLevel } from '../../actions/connect.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HeaderInView from '../../header/HeaderInView';
import { workoutScale } from '../../constants/workoutScale';

function debounceFn(fn, delay) {
  let fnTimer = null;
  return function() {
    const args = arguments;
    clearTimeout(fnTimer);
    fnTimer = setTimeout(() => {
      fn.apply(this, args)
    }, delay);
  }
}

class ActivityLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    }

    this._slidingComplete = debounceFn(this._slidingComplete, 250);

  }

  _handlePress() {
    this.props.navigation.navigate("MatchingView")
  }

  _renderHeader(){
    (this.props);
    return (
      <HeaderInView
          leftElement={{icon: "ios-close"}}
          title='Connect'
          _onPressLeft={() => this.props.navigation.goBack()}/>
    )
  }

  _getLevel(level){
    return workoutScale[Math.floor(level)][0];
  }

  _getQoute(level){
    return workoutScale[Math.floor(level)][1];
  }

  // This one is debounced in constructor
  _slidingComplete(value){
    this.props.action.setActivityLevel(value)
  }



  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        {this._renderHeader()}

        <View style={loginStylesInverse.container}>
          <Text style={[loginStylesInverse.header, {paddingTop: 20, paddingBottom: 20}]}>
            ACTIVITY LEVEL
          </Text>
          <Text style={loginStylesInverse.textMid}>
            How hard do you want to work out?
          </Text>

          <View style={[loginStylesInverse.form, {borderBottomWidth: 0}]}>
            <Text style={loginStylesInverse.input}>
                Choose a level of activity...
            </Text>
          </View>

          <Slider
            style={{width: 260, alignSelf: 'center'}}
            value={this.props.activityLevel}
            minimumValue={0}
            maximumValue={10}
            step={1}
            onValueChange={(value) =>
              this._slidingComplete(value)
            } />

          <Text style={[loginStylesInverse.input, {height: 50, marginTop: 20, fontSize: 40}]}>
            {this._getLevel(this.props.activityLevel)}
          </Text>
          <Text style={[loginStylesInverse.input, {height: 100, marginTop: 10, fontSize: 20}]}>
            {this._getQoute(this.props.activityLevel)}
          </Text>
          {(this.props.error) ? (<Text style={commonStyle.error}> {this.props.error} </Text>) : <Text style={commonStyle.hidden}> </Text> }
        </View>
        <TouchableHighlight style={loginStylesInverse.swipeBtn} onPress={() => this._handlePress()}>
          <Text style={loginStylesInverse.btnText}>
            FIND A MATCH
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
};

const mapStateToProps = function(state) {
  return {
    activityLevel: state.connect.activityLevel,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({setActivityLevel}, dispatch),
    exnavigation: bindActionCreators({ pop, push, resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityLevel);
