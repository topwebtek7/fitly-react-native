import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import LogoutBtn from '../common/LogoutBtn.js';
import HeaderInView from '../header/HeaderInView.js'


import { resetTo, pop } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class SettingsMenu extends Component {
  constructor(props) {
    super(props);
    this.state={
      view: 'all',
    }
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{icon: "ios-close"}}
        title="Settings"
        _onPressLeft={() => {
          this.props.navigation.goBack()
        }}
      />
    );
  };

  _renderSettings(sectionHeader, entries){
    return (
      <View style={{borderBottomWidth: 1, borderBottomColor: 'black'}}>
        <View style={{borderBottomWidth: .75, borderBottomColor: 'gray', height: 40, justifyContent: 'center'}}>
        <Text style={{marginLeft: 15, color: 'black', fontSize: 18}}>{sectionHeader}</Text>
        </View>
        {entries.map(e=>{
          return (
            <TouchableOpacity
              onPress={this._changeView.bind(this, e)}
              key={e}>
              <View style={{flexDirection: 'row', borderBottomWidth: .5, borderBottomColor: 'gray', height: 40, alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20}}>
                <Text style={{fontSize: 16}}>{e}</Text>
                <Icon name="ios-arrow-forward"></Icon>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  _changeView(e){
    switch (e) {
      case 'Edit Profile':
        this.setState({
          view: 'EditProfile'
        })
        break;
      case 'Change Password':
        this.setState({
          view: 'ChangePassword'
        })
        break;
    }
  }

  _renderSettingView(){
    switch (this.state.view) {
      case 'EditProfile':
        return(
          <EditProfile
            {...this.props}
            goBack={this._goBack.bind(this)}
            />
        )
        break;
      case 'ChangePassword':
        return(
          <ChangePassword
            {...this.props}
            goBack={this._goBack.bind(this)}
            />
        )
        break;

    }
  }

  _goBack(){
    this.setState({
      view: 'all'
    })
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        {this._renderHeader()}
        <ScrollView>
          {
            this.state.view === 'all' ?
            <View>
              {this._renderSettings('Account', ['Edit Profile', 'Change Password'])}
              <LogoutBtn navigation={this.props.navigation}/>
            </View>
            :
            this._renderSettingView()
          }
        </ScrollView>
      </View>
    )
   }
 };

 const mapStateToProps = function(state) {
   return {
     uID: state.auth.uID,
     user: state.user.user,
     FitlyFirebase: state.app.FitlyFirebase,
   };
 };

 const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ resetTo, pop }, dispatch)
  };
 }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsMenu);
