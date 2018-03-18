import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Slider } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AutoExpandingTextInput from '../common/AutoExpandingTextInput.js';
import { composeStyle, optionStyle, feedEntryStyle, FitlyBlue, commonStyle } from '../styles/styles.js';

import { firebaseGetCurrentUser } from '../library/firebaseHelpers.js';


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


export default class EditProfile extends Component {
  constructor(props){
    super(props);
    const { first_name, last_name } = this.props.user.public
    const { height, weight, activeLevel } = this.props.user.private
    this.state = {
      editFName: false,
      editLName: false,
      editHeight: false,
      editWeight: false,
      fName: first_name,
      lName: last_name,
      height: height,
      weight: weight,
      activeLevel: activeLevel,
      success: false,
      error: false,
    }
    this.userDataRef = this.props.FitlyFirebase.database().ref('users/' + this.props.uID)
  }

  _clear(){
    this.setState({
      error: false,
      success: false,
    })
  }

  _updateData(){
    this._clear();
    if(this.state.fName.length === 0 || this.state.lName.length === 0){
      this.setState({
        error: "Can't have an empty field"
      })
      return;
    }
    const updatePublic ={
      ...this.props.user.public,
      first_name: this.state.fName,
      last_name: this.state.lName,
    }
    const updatePrivate = {
      ...this.props.user.private,
      height: this.state.height,
      weight: this.state.weight,
      activeLevel: this.state.activeLevel,
    }

    const updateObj = {}
    updateObj['/public'] = updatePublic;
    updateObj['/private'] = updatePrivate;

    let user = this.props.FitlyFirebase.auth().currentUser;
    user.updateProfile({
      displayName: this.state.fName + ' ' + this.state.lName
    }).then(()=>{
      this.userDataRef.update(updateObj)
      .then(this.setState({success: 'Success'}, ()=>firebaseGetCurrentUser()));
    }, (error)=>{
      this.setState({error: 'An error has happened: ' + error})
    })
  }

  _renderFirstName() {
    return (
      <View style={[optionStyle.entry, {paddingTop: 15, paddingBottom: 15}]}>
        {(this.state.editFName)
          ? <AutoExpandingTextInput
            clearButtonMode="always"
            autoFocus={true}
            onChangeText={(text) => this.setState({fName: text})}
            style={{marginLeft: 20, width: 300, fontSize: 16}}
            multiline={true}
            onSubmitEditing={() => this.setState({editFName: false})}
            onEndEditing={() => this.setState({editFName: false})}
            value={this.state.fName}
            placeholder="First Name"
            placeholderTextColor="grey"
          />
          : <View>
            <Text style={{marginLeft: 20}}>First Name: </Text>
            <Text style={{marginLeft: 20, width: 300}}>{(this.state.fName.length) ? this.state.fName : ''}</Text>
          </View>
        }
        <TouchableOpacity
          style={optionStyle.icon}
          onPress={() => this.setState({editFName: !this.state.editFName})}>
          <Icon name="ios-create-outline" size={30} color="#bbb"/>
        </TouchableOpacity>
      </View>
    )
  }

  _renderLastName() {
    return (
      <View style={[optionStyle.entry, {paddingTop: 15, paddingBottom: 15}]}>
        {(this.state.editLName)
          ? <AutoExpandingTextInput
            clearButtonMode="always"
            autoFocus={true}
            onChangeText={(text) => this.setState({lName: text})}
            style={{marginLeft: 20, width: 300, fontSize: 16}}
            multiline={true}
            onSubmitEditing={() => this.setState({editLName: false})}
            onEndEditing={() => this.setState({editLName: false})}
            value={this.state.lName}
            placeholder="Last Name"
            placeholderTextColor="grey"
          />
          : <View>
            <Text style={{marginLeft: 20}}>Last Name:</Text>
            <Text style={{marginLeft: 20, width: 300}}>{(this.state.lName.length) ? this.state.lName : ''}</Text>
          </View>
        }
        <TouchableOpacity
          style={optionStyle.icon}
          onPress={() => this.setState({editLName: true})}>
          <Icon name="ios-create-outline" size={30} color="#bbb"/>
        </TouchableOpacity>
      </View>
    )
  }

  _renderHeight() {
    return (
      <View style={[optionStyle.entry, {paddingTop: 15, paddingBottom: 15}]}>
        {(this.state.editHeight)
          ? <AutoExpandingTextInput
            clearButtonMode="always"
            autoFocus={true}
            onChangeText={(text) => this.setState({height: text})}
            style={{marginLeft: 20, width: 300, fontSize: 16}}
            multiline={true}
            onSubmitEditing={() => this.setState({editHeight: false})}
            onEndEditing={() => this.setState({editHeight: false})}
            value={this.state.height}
            placeholder="Height"
            placeholderTextColor="grey"
          />
          : <View>
            <Text style={{marginLeft: 20}}>Height: </Text>
            <Text style={{marginLeft: 20, width: 300}}>{(this.state.height) ? this.state.height : ''}</Text>
          </View>
        }
        <TouchableOpacity
          style={optionStyle.icon}
          onPress={() => this.setState({editHeight: !this.state.editHeight})}>
          <Icon name="ios-create-outline" size={30} color="#bbb"/>
        </TouchableOpacity>
      </View>
    )
  }

  _renderWeight() {
    return (
      <View style={[optionStyle.entry, {paddingTop: 15, paddingBottom: 15}]}>
        {(this.state.editWeight)
          ? <AutoExpandingTextInput
            clearButtonMode="always"
            autoFocus={true}
            onChangeText={(text) => this.setState({weight: text})}
            style={{marginLeft: 20, width: 300, fontSize: 16}}
            multiline={true}
            onSubmitEditing={() => this.setState({editWeight: false})}
            onEndEditing={() => this.setState({editWeight: false})}
            value={this.state.weight}
            placeholder="Weight"
            placeholderTextColor="grey"
          />
          : <View>
            <Text style={{marginLeft: 20}}>Weight: </Text>
            <Text style={{marginLeft: 20, width: 300}}>{(this.state.weight) ? this.state.weight : ''}</Text>
          </View>
        }
        <TouchableOpacity
          style={optionStyle.icon}
          onPress={() => this.setState({editWeight: !this.state.editWeight})}>
          <Icon name="ios-create-outline" size={30} color="#bbb"/>
        </TouchableOpacity>
      </View>
    )
  }

  _renderActiveLevel(){
    return (
      <View style={[optionStyle.entry, {flexDirection: 'column', paddingTop: 15, paddingBottom: 15}]}>
        <Text>Activity Level</Text>
        <Slider
          style={{width: 260, alignSelf: 'center'}}
          value={this.state.activeLevel}
          minimumValue={0}
          maximumValue={10}
          step={.5}
          onValueChange={(value) => this.setState({activeLevel: value})} />
        <Text style={{fontSize: 20}}>
            {this.state.activeLevel}
          </Text>
      </View>
    )
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
        {this._renderFirstName()}
        {this._renderLastName()}
        {this._renderHeight()}
        {this._renderWeight()}
        {this._renderActiveLevel()}
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            style={Settings.btn}
            onPress={()=>this.props.goBack()}>
            <Text style={{color: 'white', textAlign: 'center'}}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._updateData.bind(this)}
            style={Settings.btn}>
            <Text style={{color: 'white', textAlign: 'center'}}>Save</Text>
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
