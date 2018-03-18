import React, { Component } from 'react';
import { composeStyle, headerStyle } from '../styles/styles.js';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { pop, push } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class HeaderProfile extends Component {
  constructor(props) {
    super(props);
  }

  _goToSettings = () => {
    this.props.navigator.navigate('SettingsMenu');
  };

  _goToMessagingScreen = () => {
    this.props.navigator.navigate('MessagingScene');
  };

  render() {
    return (
      <View style={headerStyle.inlineHeader}>
        <Text style={[headerStyle.logoText, { left: 15, bottom: 10 }]}>
          Fitly
        </Text>
        <TouchableOpacity
          style={[
            headerStyle.msgBtn,
            { right: 60, bottom: 15, alignItems: 'center', width: 50 }
          ]}
          onPress={() =>
            this.props.navigation.push({ key: 'MessagingScene', global: true })
          }
        >
          <Icon name="envelope-o" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            headerStyle.settingsBtn,
            { right: 10, bottom: 14, alignItems: 'center', width: 50 }
          ]}
          onPress={() =>
            this.props.navigation.push({
              key: 'SettingsMenu',
              showHeader: false,
              global: true
            })
          }
        >
          <Icon name="bars" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    navState: state.navState
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop, push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderProfile);
