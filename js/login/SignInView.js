/**
 * @flow
 */

import React, { Component } from 'react';
import { StatusBar, TextInput, TouchableHighlight, TouchableOpacity, ScrollView, Text, View, ActivityIndicator, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { loginStyles, loadingStyle, commonStyle } from '../styles/styles.js'
import FBloginBtn from '../common/FBloginBtn.js';
import { setFirebaseUID, setSignInMethod, printAuthError, clearAuthError } from '../actions/auth.js';
import { storeUserProfile } from '../actions/user.js';
import { setBlocks } from '../actions/blocks.js';
import { setLoadingState, setSearchLocation } from '../actions/app.js';
import { resetTo } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateCurrentLocationInDB } from '../library/firebaseHelpers.js';
import Icon from 'react-native-vector-icons/Ionicons';

const isAndroid = Platform.OS === 'android'

class SignInView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '', //q948066@mvrht.net
      password: '', //qweqwe
    }
  }

  componentWillMount() {
    this.props.action.clearAuthError();
    this.props.action.setLoadingState(false);
  }

  _handleEmailSignin() {
    //TODO: validate the email, password and names before sending it out
    const { navigation, action } = this.props;
    const { FitlyFirebase } = this.props.navigation.state.params;
    (async () => {
      try {
        action.clearAuthError();
        action.setLoadingState(true);
        const authData = await FitlyFirebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
        action.setSignInMethod('Email');
        action.setFirebaseUID(authData.uid);
        await updateCurrentLocationInDB(authData.uid);
        //TODO abstract away check for profile completion, write a isProfileComplete function
        const userRef = FitlyFirebase.database().ref('users/' + authData.uid);
        const firebaseUserData = (await userRef.once('value')).val();
        const blocks = (await FitlyFirebase.database().ref('blocks/'+authData.uid).once('value')).val();
        if (authData.emailVerified === false) {
          navigation.navigate("VerifyEmailView", {authData: authData, email: this.state.email, password: this.state.password});
          action.setLoadingState(false)
        } else if (firebaseUserData.public.profileComplete === false) {
          navigation.navigate( 'SetupProfileView' );
          action.setLoadingState(false);
        } else {
          action.storeUserProfile(firebaseUserData);
          const coordinate = {
            coordinate: firebaseUserData.public.userCurrentLocation.coordinate
          };
          action.setSearchLocation(coordinate);
          action.setBlocks(blocks);
          navigation.navigate('TabNavigator');
          action.setLoadingState(false);
        }
      } catch(error) {
        action.setLoadingState(false);
        action.printAuthError(error.message);
      }
    })();
  }

  focusNextField = (nextField) => {
    this.props.action.clearAuthError();
    this.refs[nextField].focus();
  };

  _forgotPassword(){
    const { email } = this.state.email;
    let auth = this.props.FitlyFirebase.auth();
    if (!email) {
      this.setState({
        error: 'there is no email in the email field'
      })
      setTimeout(()=>{
        this.setState({error: false})
      }, 2000)
      return;
    }

    auth.sendPasswordResetEmail(email).then(()=>{
      this.setState({
        success: 'Email sent to reset password'
      })
    }, (error)=>{
      console.log(error);
    });
  }

  render() {
    const { FitlyFirebase } = this.props.navigation.state.params;
    //console.log('FIREBASSS', FitlyFirebase)
    if (this.props.loading === true) {
      return (
        <View style={loadingStyle.app}>
          <StatusBar
            barStyle="default"
          />
          <ActivityIndicator
            animating={this.state.loading}
            style={{height: 80}}
            size="large"
          />
        </View>
      );
    }
    return (
      <View style={{flex: 1, backgroundColor: '#1D2F7B'}}>
        <TouchableOpacity
          style={{position: 'absolute', top: 30, left: 10, zIndex: 99}}
          onPress={()=>this.props.navigation.goBack()}>
          <Icon name="ios-arrow-back-outline" size={40} color="#fff"/>
        </TouchableOpacity>
        <ScrollView keyboardDismissMode={isAndroid ? "none" : "on-drag"} contentContainerStyle={loginStyles.container}>
          <KeyboardAvoidingView behavior="position" style={loginStyles.container}>
            <StatusBar
              barStyle="light-content"
            />
          <Text style={loginStyles.logo}>
              Fitly
            </Text>

            <FBloginBtn navigation={this.props.navigation} FitlyFirebase={FitlyFirebase} label="Log In With Facebook"/>
            <Text style={loginStyles.textSmall}>
              or
            </Text>

            <View style={loginStyles.form}>
              <TextInput
                underlineColorAndroid={'transparent'}
                returnKeyType="next"
                maxLength={30}
                clearButtonMode="always"
                ref="1"
                onSubmitEditing={() => this.focusNextField('2')}
                style={loginStyles.input}
                onChangeText={(text) => this.setState({email: text})}
                value={this.state.email}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor="white"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={loginStyles.form}>
              <TextInput
                underlineColorAndroid={'transparent'}
                returnKeyType="done"
                maxLength={30}
                clearButtonMode="always"
                ref="2"
                style={loginStyles.input}
                onSubmitEditing={() => this._handleEmailSignin()}
                onChangeText={(text) => this.setState({password: text})}
                value={this.state.password}
                keyboardType="default"
                secureTextEntry={true}
                placeholder="Password"
                placeholderTextColor="white"
              />
            </View>
            {/* TODO: need to implement the forget password and reset password feature */}
            <TouchableHighlight onPress={() => this._forgotPassword()}>
              <Text style={[loginStyles.textSmall, {marginTop: 0}]}>
                Forgot your password?
              </Text>
            </TouchableHighlight>
            {
              // new stuff
            //
            // <TouchableHighlight
            //   onPress={() => this.props.navigation.resetTo({ key: 'SignUpView', global: true })}>
            //   <Text style={loginStyles.boldSmall}>
            //     Create Account
            //   </Text>
            // </TouchableHighlight>

              // end new stuff
            }
            {(this.props.error || this.state.error) ? (<Text style={commonStyle.error}> {this.props.error || this.state.error} </Text>) : <Text style={commonStyle.hidden}> </Text> }
          </KeyboardAvoidingView>
          <Text style={{height: 100}}></Text>
        </ScrollView>
        <TouchableHighlight style={loginStyles.swipeBtn} onPress={() => this._handleEmailSignin()}>
          <Text style={loginStyles.btnText}>
            LOG IN
          </Text>
        </TouchableHighlight>
      </View>
    );
   }
 };

 const mapStateToProps = function(state) {
  return {
    loading: state.app.loading,
    error: state.auth.errorMsg
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ setFirebaseUID, setSignInMethod, printAuthError, clearAuthError, setLoadingState, storeUserProfile, setSearchLocation, setBlocks }, dispatch),
    Exnavigation: bindActionCreators({ resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignInView);
