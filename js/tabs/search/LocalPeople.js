import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Image, Slider, ActivityIndicator } from 'react-native';
import UserSearchResults from './UserSearchResults.js';

const screenWidth = Dimensions.get('window').width;
const picSize = screenWidth/3;

export default class LocalPeople extends Component{
  constructor(props){
    super(props);
    this.state ={
      sliderOpen: false,
      value: 5,
    }
  }


  componentWillReceiveProps(nextProps) {

  }

  _renderHeader(){
    return(
      <View style={{flexDirection: 'row', paddingLeft:30, paddingRight: 30, paddingBottom: 5, paddingTop: 10, justifyContent: 'space-between'}}>
        <Text style={{color: '#aaa', fontSize: 10, fontWeight: 'bold'}}>Local People</Text>
        <TouchableOpacity onPress={this._openSlider.bind(this)}>
          {this.state.sliderOpen ?
            null
            :
            <Text style={{color: 'blue', fontSize: 12}}>within {this.props.radius} miles</Text>
          }
          </TouchableOpacity>
      </View>
    )
  }

  _openSlider(){
    this.setState({
      sliderOpen: !this.state.sliderOpen,
    })
  }

  _setSearchDistance(value){
    this.props.setSearchDistance(value);
    this._openSlider();
  }

  _renderSlider(){
    return <View style={{flexDirection: 'row', position: 'absolute', top: 5, right: 30, alignItems: 'center', zIndex: 10}}>
      <Text style={{color: 'blue', fontSize: 20, marginRight: 10}}>
        {this.state.value} miles
      </Text>
      <Slider
        style={{width: 100, height: 20}}
        value={this.props.radius}
        minimumValue={5}
        maximumValue={30}
        step={5}
        onValueChange={(value)=>this.setState({ value: value })}
        onSlidingComplete={this._setSearchDistance.bind(this)}/>
    </View>
  }

  _renderUsers(){
    return (
      <ScrollView
        horizontal={true}>
        {this.props.localPeople.map((user, i)=>this._renderUser(user, i))}
        {this.props.reachedEnd ? null : this._renderMoreButton()}
      </ScrollView>
    )
  }

  _renderMoreButton(){
    let style = {alignItems: 'center'};
    return (
      <TouchableOpacity style={style} key={'loadMore'} onPress={()=>this.props.getMoreUsers()}>
        <Image
          style={[localPeople.profilePic, {alignItems: 'center', justifyContent: 'center'}]}
          source={null}>
          <Text>Load{'\n'}More</Text>
        </Image>
      </TouchableOpacity>
    )
  }

  _renderUser(user, key){
    let style = {paddingLeft: 30, alignItems: 'center'};
    if (key === this.props.localPeople.length-1) style['marginRight'] = 30;
    if(user.id===this.props.uID) return null;
    return (
      <TouchableOpacity style={style} key={key} onPress={()=>this.props.goToProfile(user.id)}>
        <Image
          style={localPeople.profilePic}
          source={{uri: user.picture}}/>

          <Text style={{}}>{user.full_name.length>15 ? user.full_name.slice(0,12) + '...' : user.full_name}</Text>
      </TouchableOpacity>
    )
  }

  render(){
    return(
      <View style={{
          flexDirection: 'column',
          height: 130,
          justifyContent: 'flex-start',
          backgroundColor: 'white',
          borderBottomWidth: 0.5,
          borderBottomColor: "#ccc"}}>
        {this._renderHeader()}
        {this.state.sliderOpen ? this._renderSlider() : null}
        {this.props.loading ?
          <ActivityIndicator
            animating={this.state.loading}
            style={{height: 80}}
            size="large"/>
          :
          this._renderUsers()
        }
      </View>
    )
  }
}

const alternateBlue = '#326fd1';

const localPeople = StyleSheet.create({
  notif_container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    width: screenWidth-30,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    position: 'relative',
  },
  left: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  profilePic:{
    // alignSelf: 'flex-start',
    borderRadius: 40,
    width: 80,
    height: 80,
    borderWidth: .5,
    borderColor: alternateBlue,
    justifyContent: 'center'
  },
  text:{
    marginLeft: 5,
    flex: 1,
    flexDirection: "column",
  },
  kind: {
    width: 45,
    height: 45,
    marginLeft: 10,
    borderColor: 'black',
    borderWidth: 0.5,
  },
  email_text: {
    fontSize: 18
  }
});
