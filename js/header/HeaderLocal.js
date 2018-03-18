/**
 * @flow
 */

import React, { Component } from 'react';
import { NavigationExperimental, View, Text, TouchableOpacity } from 'react-native';
const { Header } = NavigationExperimental;
import Icon from 'react-native-vector-icons/FontAwesome';
import { headerStyle } from '../styles/styles.js';
import { pop, push } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class HeaderLocal extends Component {
  constructor(props) {
    super(props);
  }

  _renderTitleComponent(sceneProps) {
    if (sceneProps.scene.route.key === "Profile") {
      return (
        //header for the profile home view
        <View style={[headerStyle.container, {position: 'absolute', left: 0, right: 0, height: 60, borderColor: 'red', borderWidth: 1}]}>
          <Text style={headerStyle.logoText}>
            Fitly
          </Text>
          <TouchableOpacity style={headerStyle.msgBtn}>
            <Icon name="envelope-o" size={30} color="white" onPress={() => this.props.navigation.navigate("MessagingScene")} />
          </TouchableOpacity>
          <TouchableOpacity
            style={headerStyle.settingsBtn}
            onPress={() => this.props.navigation.push({key: "SettingsMenu", showHeader: false, global: true})}>
            <Icon name="bars" size={30} color="white"/>
          </TouchableOpacity>
        </View>
      )
    }else {
      let componentKey = sceneProps.scene.route.key.split('@')[0];
      let headerTitle = sceneProps.scene.route.headerTitle;
      if(componentKey==='Search') return <View></View>
      return (
        //header for the profile home view
        <View style={headerStyle.container}>
          <Text style={headerStyle.titleText}>
            {headerTitle || componentKey}
          </Text>
        </View>
      )
    }
  }

  render() {
    return (
      <Header
        {...this.props.sceneProps}
        renderTitleComponent={this._renderTitleComponent.bind(this)}
        onNavigateBack={this.props.navigation.pop.bind(this, {global: false})}
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

export default connect(mapStateToProps, mapDispatchToProps)(HeaderLocal);
