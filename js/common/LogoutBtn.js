/**
 * @flow
 */

import React, { Component } from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import { headerStyle, FitlyBlue } from '../styles/styles.js';
import { asyncFBLogout } from '../library/asyncFBLogin.js';
import { resetAuthState, printAuthError } from '../actions/auth.js';
import { clearUserProfile } from '../actions/user.js';
import { resetTo, clearLocalNavState } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {NavigationActions} from 'react-navigation';

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

class LogoutBtn extends Component {
  constructor(props) {
    super(props);
  }

  //refactor out later into a service or a logout btn component
  _logout() {
    (async () => {
      try {
        if (this.props.signInMethod === 'Facebook') {
          await asyncFBLogout();
        }
        const navAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({routeName: 'WelcomeView'})
          ]
        })
        await this.props.FitlyFirebase.auth().signOut()
        this.props.action.resetAuthState();
        this.props.navigation.dispatch(navAction)

        // setting User to null will throw error for other components.
        // this.props.action.clearUserProfile();
      } catch(err) {
        this.props.action.printAuthError(err);
        console.log('Uh oh... something weird happened', err)
      }
    })();
  }

  render() {
    return (
      <TouchableHighlight style={btnStyle} onPress={() => this._logout()}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          Logout
        </Text>
      </TouchableHighlight>
    )
   }
 };

 const mapStateToProps = function(state) {
  return {
    signInMethod: state.auth.signInMethod,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ resetAuthState, printAuthError, clearUserProfile }, dispatch),
    exnavigation: bindActionCreators({ resetTo, clearLocalNavState }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LogoutBtn);
