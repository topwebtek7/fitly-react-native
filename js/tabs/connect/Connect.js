import React, { Component } from 'react';
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import { loginStyles, loginStylesInverse, FitlyBlue, tabHeight } from '../../styles/styles.js';
import { pop, push, resetTo } from '../../actions/navigation.js';
import { setWorkoutType } from '../../actions/connect.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HeaderLocal from '../../header/HeaderLocal'

const { FBbtn } = StyleSheet.flatten(loginStyles);
const flattenBtn = StyleSheet.flatten(FBbtn);

const buttonStyles = StyleSheet.create({
  notPressed: {
    ...flattenBtn,
    backgroundColor: 'white',
    borderWidth: .5, 
    borderColor: FitlyBlue
  },
  pressed: {
    ...flattenBtn,
    backgroundColor: FitlyBlue,
  },
  textPressed: {
    color: 'white',
  }
})

class Connect extends Component {

  state = {
    pressedButton: null
  }

  constructor(props) {
    super(props);
  }

  _getBtnStyle(workoutType) {
    return (this.props.workoutType === workoutType) ? loginStylesInverse.FBbtn : [loginStyles.FBbtn, {borderWidth: .5, borderColor: FitlyBlue}];
  }

  _getBtnTextStyle(workoutType) {
    return (this.props.workoutType === workoutType) ? loginStylesInverse.btnText : loginStyles.btnText;
  }

  _onPress(type) {
    this.props.action.setWorkoutType(type);
    this.props.navigation.push({
      key:'ActivityLevel',
      headerTitle: 'Connect',
      global: true,
      passProps:{
        ...this.props
      }
    })
  }

  _setPressed = (btnName) => {
    this.setState(() => ({
      pressedButton: btnName || null
    }))
  }

  render() {
    const isStrButtonPressed = this.state.pressedButton === 'strength';
    const isCardioButtonPressed = this.state.pressedButton === 'cardio';
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <HeaderLocal sceneProps={this.props.sceneProps}/>

        <Text style={[loginStylesInverse.textMid, {margin: 60}]}>Select Workout Type</Text>

        <TouchableHighlight
          activeOpacity={1}
          underlayColor='rgba(29,47,123,.8)'
          onShowUnderlay={() => this._setPressed('cardio')}
          onHideUnderlay={() => this._setPressed()}
          style={isCardioButtonPressed ? buttonStyles.pressed : buttonStyles.notPressed}
          onPress={this._onPress.bind(this, 'cardio')}>
            <Text style={ isCardioButtonPressed ? loginStylesInverse.btnText : loginStyles.btnText }>Cardio</Text>
        </TouchableHighlight>

        <Text style={loginStylesInverse.textMid}>or</Text>

        <TouchableHighlight
          activeOpacity={1}
          underlayColor='rgba(29,47,123,.8)'
          onShowUnderlay={() => this._setPressed('strength')}
          onHideUnderlay={() => this._setPressed()}
          style={isStrButtonPressed ? buttonStyles.pressed : buttonStyles.notPressed}
          onPress={this._onPress.bind(this, 'strength_training')}>
            <Text style={ isStrButtonPressed ? loginStylesInverse.btnText : loginStyles.btnText }>Strength Training</Text>
        </TouchableHighlight>
        {
          // <TouchableHighlight
          //    style={[loginStylesInverse.swipeBtn, {bottom: tabHeight}]} onPress={() => this.props.navigation.push({
          //      key:'ActivityLevel',
          //      headerTitle: 'Connect',
          //      global: true,
          //      passProps:{
          //        ...this.props
          //      }
          //    })}>
          //    <Text
          //      style={loginStylesInverse.btnText}>
          //      CONTINUE
          //    </Text>
          //  </TouchableHighlight>
         }
      </View>
    );
  }
};

const mapStateToProps = function(state) {
  return {
    workoutType: state.connect.workoutType,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ setWorkoutType }, dispatch),
    navigation: bindActionCreators({ pop, push, resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Connect);
