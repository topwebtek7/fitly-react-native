/**
 * @flow
 */

import React, { Component } from 'react';
import { StatusBar, TextInput, TouchableOpacity, Text, View } from 'react-native';
import { loginStylesInverse, loadingStyle, commonStyle } from '../styles/styles.js'
import FBloginBtn from '../common/FBloginBtn.js';
import { setFirebaseUID, setSignInMethod, resetAuthState } from '../actions/auth.js';
import { setLoadingState } from '../actions/app.js';
import { resetTo } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { firebaseGetCurrentUser } from '../library/firebaseHelpers.js';

import {NavigationActions} from 'react-navigation';


class VerifyEmailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      error: null,
      notification: null,
      loading: false,
    }

    this.FitlyFirebase = this.props.FitlyFirebase;
    this._checkVerificationStatus = this._checkVerificationStatus.bind(this);
    this._returnToWelcomeView = this._returnToWelcomeView.bind(this);
    this.action = this.props.action;

  }

  componentDidMount() {
    this.action.setLoadingState(false);
  }

  _checkVerificationStatus() {
    (async () => {
      try {
        this.setState({
          error: null,
          notification: null,
          loading: true,
        });
        //normally Firebase need to call auth().applyActionCode(code) to update the emailVerified attribute of the authData, otherwise emailVerified will remain false
        //we need know emailVerified because we want user to signup with legitimate emails, but in mobile, applyActionCode is not possible without a dedicated server,
        //the code below forces emailVerified to update after user has verified the email by signing out the user and signin again to trigger a refreash on emailVerified
        await this.FitlyFirebase.auth().signOut();
        // ^&
        const authData = await this.FitlyFirebase.auth().signInWithEmailAndPassword(this.props.navigation.state.params.email, this.props.navigation.state.params.password);
        this.setState({loading: false});
        if (authData.emailVerified) {
          this.action.setSignInMethod('Email');
          this.action.setFirebaseUID(authData.uid);
          this.props.navigation.navigate('SetupProfileView');
          const setupProfileNavActions = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({routeName: "SetupProfileView"})
            ]
          })
          this.props.navigation.dispatch(setupProfileNavActions);
        } else {
          this.setState({error: 'Email is not verified'});
        }
      } catch(error) {
        this.setState({
          error: error.message,
          loading: false
        });
      }
    })();
  }

  _returnToWelcomeView() {
    (async () => {
      await this.FitlyFirebase.auth().signOut();
      const resetNavigationAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName: "WelcomeView"})]
      });
      this.action.resetAuthState();
      this.props.navigation.dispatch(resetNavigationAction);
    })()
    
  }

  render() {
    return (
      <View style={[loginStylesInverse.container, {flex: 1}]}>
        <StatusBar barStyle="light-content"/>
        <Spinner visible={this.state.loading} textContent={"verifying..."} textStyle={{color: '#FFF'}}/>
        <Text style={loginStylesInverse.header}>VERIFY EMAIL</Text>
        <Text style={[loginStylesInverse.textMid, {marginBottom: 60}]}>Please verify your email by clicking the link in your email</Text>
        <TouchableOpacity
          style={[loginStylesInverse.Btn]}
          onPress={this._checkVerificationStatus}>
          <Text style={loginStylesInverse.btnText}>CONTINUE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={loginStylesInverse.Btn}
          onPress={() => {
            this.setState({
              error: null,
              notification: 'Please check your email for verification link'
            })
            this.props.navigation.state.params.authData.sendEmailVerification();
        }}>
          <Text style={loginStylesInverse.btnText}>RESEND EMAIL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={loginStylesInverse.Btn}
          onPress={this._returnToWelcomeView}>
          <Text style={loginStylesInverse.btnText}>CANCEL</Text>
        </TouchableOpacity>
        {(this.state.error) ? (<Text style={commonStyle.error}> {this.state.error} </Text>) : null }
        {(this.state.notification) ? (<Text style={[commonStyle.error, {color: 'green'}]}> {this.state.notification} </Text>) : null }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    action: bindActionCreators({ setFirebaseUID, setLoadingState, setSignInMethod, resetAuthState }, dispatch),
    exnavigation: bindActionCreators({ resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmailView);
