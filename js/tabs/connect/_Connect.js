import React, { Component } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import {
  loginStyles,
  loginStylesInverse,
  FitlyBlue,
  tabHeight
} from '../../styles/styles.js';
import { pop, push, resetTo } from '../../actions/navigation.js';
import { setWorkoutType } from '../../actions/connect.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { StackNavigator } from 'react-navigation';

class Connect extends Component {
  constructor(props) {
    super(props);
  }

  _getBtnStyle(workoutType) {
    return this.props.workoutType === workoutType
      ? loginStylesInverse.FBbtn
      : [loginStyles.FBbtn, { borderWidth: 1, borderColor: FitlyBlue }];
  }

  _getBtnTextStyle(workoutType) {
    return this.props.workoutType === workoutType
      ? loginStylesInverse.btnText
      : loginStyles.btnText;
  }

  _onPress(type) {
    this.props.action.setWorkoutType(type);
    this.props.screenProps.rootNavigation.navigate('ActivityLevel', {
      ...this.props
    });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View
          style={{
            height: 80,
            backgroundColor: FitlyBlue,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text
            style={{
              fontFamily: 'HelveticaNeue',
              fontWeight: '700',
              letterSpacing: -1,
              fontSize: 22,
              color: 'white',
              marginBottom: -10
            }}
          >
            Connect+
          </Text>
        </View>
        <Text style={[loginStylesInverse.textMid, { margin: 60 }]}>
          Select Workout Type
        </Text>
        <TouchableHighlight
          style={this._getBtnStyle('cardio')}
          onPress={this._onPress.bind(this, 'cardio')}
        >
          <Text style={this._getBtnTextStyle('cardio')}>Cardio</Text>
        </TouchableHighlight>
        <Text style={loginStylesInverse.textMid}>or</Text>
        <TouchableHighlight
          style={this._getBtnStyle('strength_training')}
          onPress={this._onPress.bind(this, 'strength_training')}
        >
          <Text style={this._getBtnTextStyle('strength_training')}>
            Strength Training
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    workoutType: state.connect.workoutType,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ setWorkoutType }, dispatch),
    exnavigation: bindActionCreators({ pop, push, resetTo }, dispatch)
  };
};

const ConnectedConnectView = connect(mapStateToProps, mapDispatchToProps)(
  Connect
);

const connectRoutes = {
  Connect: { screen: ConnectedConnectView }
};

const ConnectStackNavigation = StackNavigator(connectRoutes, {
  headerMode: 'none',
  initialRouteName: 'Connect'
});

class ConnectNavigationWrapper extends React.Component {
  static navigationOptions = {
    tabBarIcon: () => <Icon name="directions-run" size={24} color="white" />
  };

  render() {
    const { navigation, screenProps } = this.props;
    const { rootNavigation } = screenProps;
    const navigationPropsToPass = {
      tabNavigation: navigation,
      rootNavigation
    };

    return <ConnectStackNavigation screenProps={navigationPropsToPass} />;
  }
}

export default ConnectNavigationWrapper;
