import React, { Component } from 'react';
import { View, Text, TouchableHighlight, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, ListView, ListItem } from 'react-native';
import TimeAgo from 'react-native-timeago';

import Icon from 'react-native-vector-icons/Ionicons';
import {composeStyle, FitlyBlue} from '../../styles/styles.js';
import Spinner from 'react-native-loading-spinner-overlay';


let screenWidth = Dimensions.get('window').width;


export default class NotifYouComponent extends Component {
  constructor(props){
    super(props);
    this.state={
      btnHide: false
    }
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
  if (following || this.state.btnHide) {
  }else {
    return (
      <TouchableHighlight style={btnStyle} onPress={()=>{
          this.props.toggleFollow(notif);
          this.setState({btnHide: true})
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          follow
        </Text>
      </TouchableHighlight>
    )
  }

}


  render(){
    let { notification, sectionID, i } = this.props
      let text;
      let contentType;
      switch (notification.type) {
        case 'follow':
          text = `started following you.`;
          contentType = 'follow';
          break;
        case 'attend':
          text = 'is going to your event';
          contentType = 'event';
          break;
        case 'share':
          text = `shared your ${notification.contentType}`;
          contentType = notification.contentType;
          break;
        case 'like':
          text = `liked your ${notification.contentType}`;
          contentType = notification.contentType;
          break;
        default:
          text = notification.sourceType === 'message' ? "replied to your message" : `commented in your ${notification.sourceType}`;
          contentType = notification.sourceType;
      }

      return (
        <TouchableOpacity
          onPress={this.props.handleClick.bind(this, notification, contentType)}
          key={i}>

          <View
            style={notif.notif_container}>

            <View style={notif.left}>

              <TouchableOpacity
                onPress={this.props.handleProfileClick.bind(this, notification.ownerID)}>
                <Image
                  style={notif[this.props.profileAccounts[notification.ownerID]+'Img']}
                  source={{uri: this.props.profilePics[notification.ownerID]}}
                  defaultSource={require('../../../img/default-user-image.png')}
                />
              </TouchableOpacity>

              <View style={notif.text}>

                  <Text style={{fontSize: 13}}>

                    <Text style={{color: alternateBlue, fontWeight: 'bold'}}>{notification.ownerName + ' '}</Text>

                    <Text style={{fontSize: 12}}>
                      {text}
                    </Text>

                  </Text>

              </View>

              <TimeAgo style={{color: "gray", fontSize: 10, right: 0, bottom: 5, position: 'absolute'}} time={notification.timestamp}/>

            </View>

            {notification.type === 'follow' ?
              <View>
              {this._createFollowBtn(notification)}
              </View>
            :
            <View style={notif.kind}>
            <Image
              key={i}
              style={notif.img}
              source={
                (notification.notifImage) ?
                {uri: notification.notifImage, isStatic:true}
                : notification.link ?
                {uri: notification.link, isStatic:true}
                : require('../../../img/default-photo-image.png')}
                defaultSource={
                  require('../../../img/default-photo-image.png')
                }/>
            </View>
            }

          </View>
        </TouchableOpacity>

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
  defaultImg:{
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: FitlyBlue,
    justifyContent: 'center'
  },
  trainerImg:{
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#FF0000',
    justifyContent: 'center'
  },
  proImg:{
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: 'gold',
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
  img:{
    width: 45,
    height: 45,
  },
  email_text: {
    fontSize: 18
  }
});
