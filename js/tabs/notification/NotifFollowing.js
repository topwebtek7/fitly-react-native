import React, { Component } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity, ListView } from 'react-native';

import {composeStyle, FitlyBlue} from '../../styles/styles.js';

let screenWidth = Dimensions.get('window').width;


export default class NotifFollowing extends Component {
  constructor(props){
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2)=> r1 !== r2});

    this.state={
      loaded: this.props.fetched,
      dataSource: ds.cloneWithRows(this.props.notifs),
    }
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      loaded: nextProps.fetched,
      dataSource: this.state.dataSource.cloneWithRows(nextProps.notifs)
    })
  }

  _handleUserClick(userId){
    this.props.openProfile(userId)
  }

  _handleContentClick(content, type){
    this.props.openPost(content, type)
  }


  _buildNotif(actions, action, user){
    let number = actions.length
    let imgs = [];
    actions.forEach((a,i)=>{
      // console.log(actions)
      imgs.push(<TouchableOpacity
                  style={notif.imgContainer}
                  key={i}
                  onPress={this._handleContentClick.bind(this, a, action)}>
                  <Image
                    style={notif.img}
                  source={(a.notifImage) ? {uri: a.notifImage, isStatic:true} : require('../../../img/default-photo-image.png')}
                  defaultSource={
                    require('../../../img/default-photo-image.png')
                  }/></TouchableOpacity>);

    })

    return (
      <TouchableOpacity
        key={user.name + action}
        onPress={this._handleUserClick.bind(this, user.userID)}>

      <View style={notif.notif_container}>
        <View style={notif.notif_header}>
          <Image
            style={notif[this.props.profileAccounts[user.userID]+'Img']}
            source={this.props.profilePics[user.userID] ? {uri: this.props.profilePics[user.userID]} : require('../../../img/default-user-image.png')}
            defaultSource={require('../../../img/default-user-image.png')}/>

          <View style={{marginLeft: 20}}>
            <Text style={{fontSize: 18}}>{user.name}</Text>
            <Text style={{fontSize: 10}}>created {number} {number>1 ? action+'s' : action}</Text>
          </View>

        </View>


        <View style={notif.notif_bar}>

          {imgs}

        </View>
      </View>
    </TouchableOpacity>
    )
  }

  _renderNotifs(notification, sectionID, rowID){

    if(this.state.loaded){
      let x = notification[0]
      let user = {pic: x.ownerPicture, name: x.ownerName, userID: x.ownerID}
      let action = x.type;
      return this._buildNotif(notification, action, user)

    } else {
      return <Text>not Rendered</Text>
    }
  }

  render(){
    return (
      <View style={{paddingBottom: 50, flex: 1}}>
        {
          this.state.loaded ?
            this.props.notifs.length ?
              <ListView
                dataSource={this.state.dataSource}
                renderRow={this._renderNotifs.bind(this)}
                />
            :
              <Text style={{textAlign: 'center', marginTop: 20, maxWidth: 200}}>You aren't following anyone or they just aren't being active.</Text>
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
    minHeight: 125,
    width: screenWidth,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  notif_header:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 70,
  },
  defaultImg:{
    borderRadius: 23,
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 46,
    height: 46,
    borderWidth: .5,
    borderColor: FitlyBlue,
    justifyContent: 'center'
  },
  trainerImg:{
    borderRadius: 23,
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 46,
    height: 46,
    borderWidth: .5,
    borderColor: '#FF0000',
    justifyContent: 'center'
  },
  proImg:{
    borderRadius: 23,
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 46,
    height: 46,
    borderWidth: .5,
    borderColor: 'gold',
    justifyContent: 'center'
  },
  notif_bar:{
    minHeight: 70,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imgContainer:{
    width: 60,
    height: 60,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
  },
  img:{
    width: 60,
    height: 60,
    borderColor: 'black',
    borderWidth: 0.5,
  },
  email_text: {
    fontSize: 18
  }
});
