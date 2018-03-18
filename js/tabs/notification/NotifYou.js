import React, { Component } from 'react';
import { View, Text, TouchableHighlight, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, ListView, ListItem } from 'react-native';
import TimeAgo from 'react-native-timeago';

import Icon from 'react-native-vector-icons/Ionicons';
import {composeStyle} from '../../styles/styles.js';
import Spinner from 'react-native-loading-spinner-overlay';
import NotifYouComponent from './NotifYouComponent'

let screenWidth = Dimensions.get('window').width;


export default class NotifYou extends Component {
  constructor(props){
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2)=> r1 !== r2});
    this.state={
      dataSource: ds.cloneWithRows(this.props.notifs),
      loading: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      loading: nextProps.fetched,
      dataSource: this.state.dataSource.cloneWithRows(nextProps.notifs)
    })
  }

  _handleProfileClick(userId){
    this.props.openProfile(userId)
  }

  _handleClick(notif, type){
    if (type === 'follow'){
      this._handleProfileClick(notif.ownerID)
    } else {
      this.props.openPost(notif, type)
    }

    // let target = notif.contentlink || '/'+notif.sourceType+'/'+notif.sourceID
  }

_createFollowBtn(notif){

  const btnStyle = {
    borderRadius: 2,
    backgroundColor: '#1D2F7B',
    width: 60,
    height: 20,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  }
  let following = notif.following;
  if (following) {
  }else {
    return (
      <TouchableHighlight style={btnStyle} onPress={()=>{
          this.props.toggleFollow(notif);
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          follow
        </Text>
      </TouchableHighlight>
    )
  }

}

_createNotif(notification, sectionID, i){
  return(
    <NotifYouComponent
      notification={notification}
      sectionID={sectionID}
      i={i}
      profilePics={this.props.profilePics}
      profileAccounts={this.props.profileAccounts}
      toggleFollow={this.props.toggleFollow}
      handleClick={this._handleClick.bind(this)}
      handleProfileClick={this._handleProfileClick.bind(this)}/>
  )
}


  render(){
    return(
      <View style={{paddingBottom: 50, flex: 1}}>
        {
          this.state.loading || this.props.notifs.length<1 ?
            this.props.notifs.length ?
              <ListView
                dataSource={this.state.dataSource}
                renderRow={this._createNotif.bind(this)}
              />
            :
              <Text style={{textAlign: 'center', marginTop: 20, maxWidth: 200}}>No one seems to be interacting with you.</Text>
          :
          <Text style={{textAlign: 'center', marginTop: 20, maxWidth: 200}}>Getting your notifications, please hold on...</Text>
        }
      </View>
    )
  }


}

const alternateBlue = '#326fd1';

const notif = StyleSheet.create({
  notif_container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
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
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    width: 40,
    height: 40,
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
