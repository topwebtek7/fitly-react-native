/**
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import GlobalNavigator from './navigator/GlobalNavigator.js';
import { storeUserProfile } from '../js/actions/user.js';
import { setBlocks } from '../js/actions/blocks.js';
import { setFirebaseUID, updateLogginStatus } from '../js/actions/auth.js';
import { resetTo } from '../js/actions/navigation.js';
import { asyncFBLogout } from './library/asyncFBLogin.js';
import {
  firebaseGetCurrentUser,
  updateCurrentLocationInDB,
} from './library/firebaseHelpers.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSearchLocation } from '../js/actions/app.js';
import {FitlyFirebase} from './library/firebaseHelpers.js';

import NewNavApp from './navigator/_GlobalNavigator';
import {NavigationActions} from 'react-navigation';

class FitlyApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    // this._checkAuth();
  }

  _checkAuth() {
    const {action, navigation } = this.props;
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

        if (
          authData.emailVerified === false &&
          authData.providerData[0].providerId === 'password'
        ) {
          NavigationActions.navigate({routeName: 'VerifyEmailView'}, { authData });
        } else if (
          firebaseUserData === null ||
          firebaseUserData.public.profileComplete === false
        ) {
          if (
            firebaseUserData === null ||
            firebaseUserData.public.provider === 'Firebase'
          ) {
            // navigation.navigate('SetupProfileView');
            NavigationActions.navigate({routeName: 'SetupProfileView'})
          } else {
            // navigation.navigate('SetupStatsView');
            NavigationActions.navigate({routeName: 'SetupStatsView'})
          }
        } else {
          action.storeUserProfile(firebaseUserData);
          const coordinate = {
            coordinate: firebaseUserData.public.userCurrentLocation.coordinate,
          };
          action.setSearchLocation(coordinate);
          action.setBlocks(blocks);
          // navigation.navigate('TabNavigator');
          NavigationActions.navigate({routeName: 'TabNavigator'})
        }
        this.setState({ loading: false });
      } catch (error) {
        console.log(
          'initial authentication check - user has not signin',
          error
        );
        this.setState({ loading: false });
        // placeholder for change
        NavigationActions.navigate({routeName: 'WelcomeView'});
        // navigation.resetTo({key: "OnBoardingSlides", global: true});
      }
    })();
  }

  render() {
    // show loading screen while checking auth status
    // if (this.state.loading) {
    //   return (
    //     <View style={styles.centering}>
    //       <ActivityIndicator
    //         animating={this.state.loading}
    //         style={{ height: 80 }}
    //         size="large"
    //       />
    //     </View>
    //   );
    // }
    return <NewNavApp FitlyFirebase={FitlyFirebase} />;
  }
}



const styles = StyleSheet.create({
  centering: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = function(state) {
  return {
    FitlyFirebase: state.app.FitlyFirebase,
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
        setBlocks,
      },
      dispatch
    ),
    exnavigation: bindActionCreators({ resetTo }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FitlyApp);
