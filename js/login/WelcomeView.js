/**
 * @flow
 */

import React, { Component } from 'react';
import {
  StatusBar,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import {
  welcomeStyles,
  loginStyles,
  loginStylesInverse,
  FitlyBlue
} from '../styles/styles.js';
import { push } from '../actions/navigation.js';
import { storeUserProfile } from '../actions/user.js';
import { setBlocks } from '../actions/blocks.js';
import { setFirebaseUID, updateLogginStatus } from '../actions/auth.js';
import { setSearchLocation } from '../actions/app.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  FitlyFirebase,
  firebaseGetCurrentUser,
  updateCurrentLocationInDB
} from '../library/firebaseHelpers.js';

import { NavigationActions } from 'react-navigation';

const { FBbtn } = StyleSheet.flatten(loginStyles);
const flattenBtn = StyleSheet.flatten(FBbtn);

const buttonStyles = StyleSheet.create({
  notPressed: {
    ...flattenBtn,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: FitlyBlue
  },
  pressed: {
    ...flattenBtn,
    backgroundColor: FitlyBlue
  },
  textPressed: {
    color: 'white'
  }
});

class WelcomeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      validating: false,
      valid: false,
      error: false,
      clicked: 'joinUs',
      loading: true
    };
  }

  componentDidMount() {
    this._checkAuth();
  }

  _checkAuth() {
    const { action, navigation } = this.props;
    const { navigate } = navigation;
    (async () => {
      try {
        // await asyncFBLogout();
        // await FitlyFirebase.auth().signOut();
        const authData = await firebaseGetCurrentUser();
        // below code are for redirection, consider refactoring it out
        action.setFirebaseUID(authData.uid);
        action.updateLogginStatus(true);

        // this line updates the currentLocation of the user on the database, when should we update the location of the user?
        await updateCurrentLocationInDB(authData.uid);
        const firebaseUserData = (await FitlyFirebase.database()
          .ref(`users/${authData.uid}`)
          .once('value')).val();

        const blocks = (await FitlyFirebase.database()
          .ref(`blocks/${authData.uid}`)
          .once('value')).val();

        this.setState({ loading: false });

        if (
          authData.emailVerified === false &&
          authData.providerData[0].providerId === 'password'
        ) {
          navigate('VerifyEmailView', { authData });
        } else if (
          firebaseUserData === null ||
          firebaseUserData.public.profileComplete === false
        ) {
          if (
            firebaseUserData === null ||
            firebaseUserData.public.provider === 'Firebase'
          ) {
            navigation.navigate('SetupProfileView');
          } else {
            navigation.navigate('SetupStatsView');
          }
        } else {
          action.storeUserProfile(firebaseUserData);
          const coordinate = {
            coordinate: firebaseUserData.public.userCurrentLocation.coordinate
          };
          action.setSearchLocation(coordinate);
          action.setBlocks(blocks);

          // If everything is ok, reset navigation to TabView
          const navAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'TabNavigator',
                params: { rootNavigation: navigation }
              })
            ]
          });

          navigation.dispatch(navAction);
        }
        //this.setState({ loading: false });
      } catch (error) {
        console.log(
          'initial authentication check - user has not signin',
          error
        );
        this.setState({ loading: false });
      }
    })();
  }

  _render() {
    const isSignUpPressed = this.state.clicked === 'signup';
    const isSignInPressed = this.state.clicked === 'signin';
    return (
      <View style={{ flex: 1 }}>
        <View style={welcomeStyles.container}>
          <StatusBar barStyle="light-content" />
          <Text style={loginStyles.logo}>Fitly</Text>
          <View style={welcomeStyles.logoContainer}>
            <Text style={welcomeStyles.messageText}>
              Find fitness with friends.
            </Text>
            <Text style={[welcomeStyles.messageTextLight, { marginTop: 10 }]}>
              Meet work out partners and find programs just for you.
            </Text>
            <View style={welcomeStyles.buttonContainer}>
              <TouchableHighlight
                activeOpacity={1}
                underlayColor="rgba(29,47,123,.8)"
                onShowUnderlay={() => this._setPressed('signup')}
                onHideUnderlay={() => this._setPressed()}
                style={
                  isSignInPressed
                    ? buttonStyles.pressed
                    : buttonStyles.notPressed
                }
                onPress={this._goToSignIn}
              >
                <Text
                  style={
                    isSignInPressed
                      ? loginStylesInverse.btnText
                      : loginStyles.btnText
                  }
                >
                  LOG IN
                </Text>
              </TouchableHighlight>

              <TouchableHighlight
                activeOpacity={1}
                underlayColor="rgba(29,47,123,.8)"
                onShowUnderlay={() => this._setPressed('signin')}
                onHideUnderlay={() => this._setPressed()}
                style={
                  isSignUpPressed
                    ? buttonStyles.pressed
                    : buttonStyles.notPressed
                }
                onPress={this._goToSignUp}
              >
                <Text
                  style={
                    isSignUpPressed
                      ? loginStylesInverse.btnText
                      : loginStyles.btnText
                  }
                >
                  SIGN UP
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={[styles.centering, { backgroundColor: FitlyBlue }]}>
          <Text style={loginStyles.logo}>Fitly</Text>
          <ActivityIndicator
            animating={this.state.loading}
            style={{ height: 80 }}
            size="large"
          />
        </View>
      );
    }
    return this._render();
  }
}

const styles = StyleSheet.create({
  centering: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators(
      {
        updateLogginStatus,
        setFirebaseUID,
        storeUserProfile,
        setSearchLocation,
        setBlocks
      },
      dispatch
    ),
    exNavigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeView);
