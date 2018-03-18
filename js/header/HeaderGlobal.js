/**
 * @flow
 */

import React, { Component } from 'react';
import { NavigationExperimental, View, Text, TouchableOpacity } from 'react-native';
const { Header } = NavigationExperimental;
import Icon from 'react-native-vector-icons/Ionicons';
import { headerStyle } from '../styles/styles.js';
import { pop, push } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LogoutBtn from '../common/LogoutBtn.js';


class HeaderGlobal extends Component {
  constructor(props) {
    super(props);
    this._renderTitleComponent = this._renderTitleComponent.bind(this);
    this._renderLeftComponent = this._renderLeftComponent.bind(this);
  }

  _renderTitleComponent(sceneProps) {
    const {key, headerTitle} = sceneProps.scene.route;
    if (key === "SettingsMenu") {
      return (
        <View style={headerStyle.container}>
          <Text style={headerStyle.titleText}>
            Settings
          </Text>
        </View>
      );
    }

    return (
      <View style={headerStyle.container}>
        <Text style={headerStyle.titleText}>
          {headerTitle}
        </Text>
      </View>
    );
  };

  _renderLeftComponent(sceneProps) {
    const {key, leftHeaderIcon = "ios-close"} = sceneProps.scene.route;
    if (key === "SettingsMenu" ||
        key === "SelectDateScene" ||
        key === "SelectLocationScene" ||
        key === "SelectInvitesScene" ||
        key === "SelectAdminsScene" ||
        key === "SelectContactScene" ||
        key === "ActivityLevel"
        ) {
      return (
        <TouchableOpacity style={headerStyle.closeBtn} onPress={() => this.props.navigation.pop({global: true})}>
          <Icon name={leftHeaderIcon} size={50} color="white"/>
        </TouchableOpacity>
      )
    }
    return null;
  };

  render() {
    return (
      <Header
        {...this.props.sceneProps}
        renderTitleComponent={this._renderTitleComponent}
        renderLeftComponent={this._renderLeftComponent}
        onNavigateBack={() => this.props.navigation.pop({global: true})}
        style={headerStyle.header}
      />
    )
   }
 };

 const mapStateToProps = function(state) {
  return {
    navState: state.navState
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    navigation: bindActionCreators({ pop, push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderGlobal);
