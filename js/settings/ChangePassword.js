import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AutoExpandingTextInput from '../common/AutoExpandingTextInput.js';
import { composeStyle, optionStyle, feedEntryStyle, FitlyBlue, commonStyle } from '../styles/styles.js';


const Settings = StyleSheet.create({
  btn:{
    borderRadius: 2,
    backgroundColor: FitlyBlue,
    width: 120,
    height: 40,
    justifyContent: "center",
    margin: 10,
    shadowColor: "black",
    shadowOpacity: .6,
    elevation: 2,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 2,
  }
})

export default class ChangePassword extends Component {
  constructor(props){
    super(props);
    this.state={
      error: false,
      success: false,
      currentPassword: 'password',
      newPassword: 'password2'
    }
  }

  _clear(){
    this.setState({
      error: false,
      success: false,
    })
  }

  _updatePassword(){
    let auth = this.props.FitlyFirebase.auth();
    let emailAddress = auth.currentUser.email;
    console.log(auth, emailAddress);
    if (!emailAddress) {
      this.setState({
        error: 'No Email On File'
      })
      return;
    }

    // var emailAddress = "user@example.com";

    auth.sendPasswordResetEmail(emailAddress).then(()=>{
      this.setState({
        success: 'Email sent to reset password'
      })
    }, function(error) {
      console.log(error);
    });
  }


  render(){
    return(
      <View>
        <TouchableOpacity
          onPress={()=>this.props.goBack()}>
          <View style={{borderBottomWidth: .75, borderBottomColor: 'gray', height: 40, alignItems: 'center', flexDirection: 'row', paddingLeft: 15}}>
            <Icon name="ios-arrow-back"></Icon>
            <Text style={{marginLeft: 5, color: 'gray'}}>Go Back</Text>
          </View>
        </TouchableOpacity>
        <View style={{margin: 20}}>
          <Text style={{textAlign: 'center'}}>
            Currently, you can request to change your password and an email will be sent to your email on file. Through that, you can change your password.
            {'\n'}
            Sorry for the inconvenience.
            {'\n\n'}
            The FitlyApp Team
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            onPress={this._updatePassword.bind(this)}
            style={Settings.btn}>
            <Text style={{color: 'white', textAlign: 'center'}}>Send Reset</Text>
          </TouchableOpacity>
        </View>
        <View>
          {
            this.state.error ?
            <Text style={{height: 40, fontWeight: '100', textAlign: 'center', color: '#FF0000'}}>{ this.state.error}</Text>
            : null
          }
          {
            this.state.success ?
            <Text style={commonStyle.success}>{ this.state.success}</Text>
            : null
          }
        </View>
      </View>
    )
  }

}
