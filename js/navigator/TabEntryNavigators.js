/**
 * @flow
 */

import React, { Component } from 'react';
import { NavigationExperimental, View, StatusBar } from 'react-native';
const { CardStack } = NavigationExperimental;
import LOCAL_ROUTES from '../navigator/RoutesLocal.js';
import HeaderLocal from '../header/HeaderLocal.js';
import { pop } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Firebase from 'firebase';

const createTabEntryNavigator = (tabKey) => {
  class TabEntryNavigator extends Component {
    constructor(props) {
      super(props);
    }

    _renderHeader(sceneProps) {
      //
      //
      //
      // console.log(sceneProps.scene.route);
      return null
      //
      //
      //
      return (sceneProps.scene.route.showHeader || sceneProps.scene.route.key === "Profile")
        ? <HeaderLocal sceneProps={sceneProps}/>
        : null;
    }

    _renderScene(sceneProps) {
      if (!this.props.isLoggedIn) {
        return (<View></View>);
      }

      //sceneProps.scene.route.key, which is the route key needs to be unique, for scenes that are reused we add an additional content key to the normal route key
      //the convention for the route key is [component name]@[content key], here we are spliting by '@' symbol to get the component name
      let componentKey = sceneProps.scene.route.key.split('@')[0];
      let Component = LOCAL_ROUTES[componentKey];
      let passProps = sceneProps.scene.route.passProps || {};
      return (<Component {...passProps} sceneProps={sceneProps}/>);
    }

    render() {
      return (
        <CardStack
          key={this.props.navState[tabKey].key}
          renderHeader={this._renderHeader}
          onNavigateBack={this.props.navigation.pop.bind(this)}
          navigationState={this.props.navState[tabKey]}
          renderScene={this._renderScene.bind(this)}
        />
      )
    }
  };

  const mapStateToProps = function(state) {
    return {
      navState: state.navState,
      isLoggedIn: state.auth.isLoggedIn,
      FitlyFirebase: state.app.FitlyFirebase,
      uID: state.auth.uID
    };
  };

  const mapDispatchToProps = function(dispatch) {
    return {
      navigation: bindActionCreators({ pop }, dispatch)
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(TabEntryNavigator);
};

export const ActivityNavigator = createTabEntryNavigator('Activity');
export const SearchNavigator = createTabEntryNavigator('Search');
export const ProfileNavigator = createTabEntryNavigator('Profile');
export const NotificationNavigator = createTabEntryNavigator('Notification');
export const ConnectNavigator = createTabEntryNavigator('Connect');
