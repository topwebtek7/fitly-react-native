/**
 * @flow
 */

import React, { Component } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { loginStyles } from '../styles/styles.js';
import {
  asyncFBLoginWithPermission,
  asyncFBLogout,
  fetchFBProfile
} from '../library/asyncFBLogin.js';
import {
  setFirebaseUID,
  setSignUpMethod,
  printAuthError,
  clearAuthError
} from '../actions/auth.js';
import { storeUserProfile } from '../actions/user.js';
import { setBlocks } from '../actions/blocks.js';
import { setLoadingState, setSearchLocation } from '../actions/app.js';
import { resetTo } from '../actions/navigation.js';
import { connect } from 'react-redux';
import Firebase from 'firebase';
import { bindActionCreators } from 'redux';
import { updateCurrentLocationInDB } from '../library/firebaseHelpers.js';
import {
  getCurrentPlace,
  getPlaceByName
} from '../library/asyncGeolocation.js';

import { NavigationActions } from 'react-navigation';
const FB_PHOTO_WIDTH = 300;

class FBloginBtn extends Component {
  constructor(props) {
    super(props);
  }

  //TODO error reporting for login error
  _handleFBLogin() {
    const { FitlyFirebase, navigation, action } = this.props;
    const resetToInterests = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'InterestsView' })]
    });

    const resetToTabNavigation = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'TabNavigator' })]
    });
    (async () => {
      try {
        action.clearAuthError();
        action.setLoadingState(true);
        await asyncFBLogout();
        const data = await asyncFBLoginWithPermission([
          'public_profile',
          'email',
          'user_friends',
          'user_location',
          'user_birthday'
        ]);
        action.setSignUpMethod('Facebook');
        const userFBprofile = await fetchFBProfile(data.credentials.token);

        if (!userFBprofile.email) {
          action.setLoadingState(false);
          action.printAuthError(
            'We need your access to your FB profile in order to create an account'
          );
          return;
        }
        const credential = Firebase.auth.FacebookAuthProvider.credential(
          data.credentials.token
        );
        const user = await FitlyFirebase.auth().signInWithCredential(
          credential
        );
        const userRef = FitlyFirebase.database().ref('users/' + user.uid + '/');
        action.setFirebaseUID(user.uid);
        const blocks = (await FitlyFirebase.database()
          .ref('blocks/' + user.uid)
          .once('value')).val();
        let api = `https://graph.facebook.com/v2.3/${
          userFBprofile.id
        }/picture?width=${FB_PHOTO_WIDTH}&redirect=false&access_token=${
          data.credentials.token
        }`;
        let userPhoto = userFBprofile.picture.data.url;
        fetch(api)
          .then(res => res.json())
          .then(resData => {
            userPhoto = resData.data.url;
          })
          .done();

        //update user's Facebook friends everytime they login with Facebook
        let firebaseUserData = (await userRef.once('value')).val();
        if (firebaseUserData === null) {
          let currentLocation;
          let userLocation = await getCurrentPlace();

          if (!userLocation) {
            currentLocation = {
              location: {
                place: 'San Francisco, CA',
                zip: '94108',
                coordinate: {
                  lat: 37.7858515,
                  lon: -122.4065285
                }
              }
            };
          } else {
            let coord = {
              lat: userLocation.position.lat,
              lon: userLocation.position.lng
            };
            currentLocation = {
              place: `${userLocation.subAdminArea}, ${userLocation.adminArea}`,
              coordinate: coord,
              zip: userLocation.postalCode
            };
          }

          const {
            first_name,
            last_name,
            picture,
            email,
            gender,
            birthday,
            friends,
            location,
            id
          } = userFBprofile;
          console.log(picture, picture.data, userPhoto);
          let api = `https://graph.facebook.com/v2.3/${
            userFBprofile.id
          }/picture?width=${FB_PHOTO_WIDTH}&redirect=false&access_token=${
            data.credentials.token
          }`;
          console.log(api);
          userRef.set({
            public: {
              account: 'default',
              first_name: first_name,
              last_name: last_name,
              picture: userPhoto,
              userLocation: location || currentLocation,
              userCurrentLocation: location || currentLocation,
              provider: 'Facebook',
              summary: '',
              profileComplete: false,
              FacebookID: id,
              dateJoined: Firebase.database.ServerValue.TIMESTAMP,
              lastActive: Firebase.database.ServerValue.TIMESTAMP,
              followerCount: 0,
              followingCount: 0,
              sessionCount: 0
            },
            private: {
              email: email,
              gender: gender || null,
              birthday: birthday || null,
              friends: friends || null,
              height: 0,
              weight: 0,
              activeLevel: 5
            }
          });

          await userRef
            .child('public')
            .child('profilePictures')
            .push()
            .set(pictureUrl);
          this.props.action.setSearchLocation(currentLocation.coordinate);
          navigation.dispatch(resetToInterests);
        } else if (firebaseUserData.profileComplete === false) {
          navigation.dispatch(resetToInterests);
        } else {
          await updateCurrentLocationInDB(user.uid);
          if (userFBprofile.friends) {
            await FitlyFirebase.database()
              .ref('users/' + user.uid + '/private/friends')
              .set(userFBprofile.friends);
          }
          await FitlyFirebase.database()
            .ref('users/' + user.uid + '/public/picture')
            .set(userPhoto);
          firebaseUserData = (await userRef.once('value')).val();
          firebaseUserData.public.picture = userPhoto;
          this.props.action.storeUserProfile(firebaseUserData);
          const coordinate = {
            coordinate: firebaseUserData.public.userCurrentLocation.coordinate
          };
          action.setSearchLocation(coordinate);
          action.setBlocks(blocks);
          navigation.dispatch(resetToTabNavigation);
        }
        action.setLoadingState(false);
      } catch (error) {
        action.setLoadingState(false);
        console.log(error);
        action.printAuthError(error.message);
      }
    })();
  }

  render() {
    return (
      <TouchableHighlight
        style={loginStyles.FBbtn}
        onPress={() => this._handleFBLogin()}
      >
        <Text style={loginStyles.btnText}>{this.props.label}</Text>
      </TouchableHighlight>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    loading: state.app.loading
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators(
      {
        setFirebaseUID,
        setSignUpMethod,
        printAuthError,
        setLoadingState,
        storeUserProfile,
        clearAuthError,
        setSearchLocation,
        setBlocks
      },
      dispatch
    ),
    exnavigation: bindActionCreators({ resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FBloginBtn);
