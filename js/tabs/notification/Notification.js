import React, { Component } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { commonStyle } from '../../styles/styles.js';
import { resetTo } from '../../actions/navigation.js';
import LogoutBtn from '../../common/LogoutBtn.js';
import { push } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Firebase from 'firebase';
import {saveUpdateToDB} from '../../library/firebaseHelpers.js'

import NotificationTabs from './NotificationTabs.js';
import HeaderLocal from '../../header/HeaderLocal'



class Notification extends Component {
  constructor(props) {
    super(props);
    this.state={
      listenerY: false,
      listenerF: false,
      notificationsYou: [],
      notificationsThem: [],
      fetched: {
        y: false,
        f: false,
      },
      profilePics: {},
      profileAccounts: {},
    }
    this.database = this.props.FitlyFirebase.database();
    this.user = this.props.user;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._turnOnYouNotificationWatcher();
      this._turnOnFollowingNotificationWatcher();
    })
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.navIndex.index===3;
  }


  _getImage(loc){
    let image;
    let postRef = this.props.FitlyFirebase.database().ref(loc);

    postRef.once('value', (s)=>{
      let post = s.val();
      if(post && post.backgroundImage){
        return post.backgroundImage;
      } else if(post && post.photos){
        // console.log(post.photos)
      } else {
        image = false;
      }
      console.log(image);
      return image;
    })
  }

  _turnOnYouNotificationWatcher() {

    let fireData = this.props.FitlyFirebase.database();
    fireData.ref('/otherNotifications/' + this.props.uID).on('child_added', (child)=>{
      if(!this.state.listenerY) return;
      console.log('child_added', child.val());
      this.setState({notificationsYou: [child.val(), ...this.state.notificationsYou]})
    })

    const setYouNotifications = function(notifs){
      let notifications = [];
      let lastNotif;
      let profilePics=Object.assign({}, this.state.profilePics);
      let profileAccounts=Object.assign({}, this.state.profileAccounts);

      notifs && Object.keys(notifs).forEach((k,i)=>{
        // this._getImage(k)
        let notif = notifs[k];
        // console.log(notif);
        if(!profileAccounts[notif.ownerID])profileAccounts[notif.ownerID]='default';
        if(!profilePics[notif.ownerID]){
          fireData.ref('users/' + notif.ownerID + '/public').once('value', data=>{
            profilePics[notif.ownerID] = data.val().picture;
            profileAccounts[notif.ownerID] = data.val().account;
          })
        }
        if(notif.type==='follow'){
          fireData.ref(`followings/${notif.followingID}/${notif.ownerID}`).once('value', d=>{
            let data = d.val();
            if (data) {
              notif.following = true;
            } else {
              notif.following = false;
            }
            notifications = [notif, ...notifications];
            if(!i) lastNotif = k;

            this.setState({
              listenerY: true,
              notificationsYou: notifications,
              lastYouNotification: lastNotif,
              fetched: {
                ...this.state.fetched,
                y: true,
              },
              profilePics: Object.assign(this.state.profilePics, profilePics),
              profileAccounts: Object.assign(this.state.profileAccounts, profileAccounts),
            });
          })
        } else {
          notifications = [notif, ...notifications];
          if(!i) lastNotif = k;

          this.setState({
            listenerY: true,
            notificationsYou: notifications,
            lastYouNotification: lastNotif,
            fetched: {
              ...this.state.fetched,
              y: true,
            },
            profilePics: Object.assign(this.state.profilePics, profilePics),
          });
        }
      })
    }

    fireData.ref('/otherNotifications/' + this.props.uID).orderByChild('timestamp').limitToLast(20).once('value', (notifs)=>{
      setYouNotifications.call(this, notifs.val());
    })

  };

  _turnOnFollowingNotificationWatcher(){
    let fireData = this.props.FitlyFirebase.database();
    fireData.ref('feeds/' + this.props.uID).on('child_added', (added_child)=>{
      if(!this.state.listenerF) return;
      let child = added_child.val()
      child.notifImage = this._getImage(child.contentlink)
      this.setState({notificationsYou: [child, ...this.state.notificationsYou]})
    })

    const setFollowingNotifications = function(notifs){
      let notifications = {};
      let fNotifs = []
      let pointer = 0;
      let profilePics=Object.assign({}, this.state.profilePics);
      let profileAccounts=Object.assign({}, this.state.profileAccounts);

      notifs && (Object.keys(notifs).reverse()).forEach((k)=>{
        let notif = notifs[k]

        if(!profileAccounts[notif.ownerID])profileAccounts[notif.ownerID]='default';

        if(!profilePics[notif.ownerID]){
          fireData.ref('users/' + notif.ownerID + '/public').once('value', data=>{
            profilePics[notif.ownerID] = data.val().picture
            profileAccounts[notif.ownerID] = data.val().account
          })
        }
        if(notif.type !== 'follow'){

          if(notifications[notif.ownerID]){
            if(notifications[notif.ownerID][notif.type]===0 || notifications[notif.ownerID][notif.type]){
              let spot = notifications[notif.ownerID][notif.type];
              fNotifs[spot].push(notif);
            } else {
              notifications[notif.ownerID][notif.type] = pointer;
              fNotifs[pointer]=[notif];
              pointer++;
            }
          } else {
            notifications[notif.ownerID]=[notif.type];
            notifications[notif.ownerID][notif.type]= pointer;
            fNotifs[pointer]=[notif];
            pointer++;
          }
        }
      })
      this.setState({
        listenerF: true,
        notificationsThem: fNotifs,
        fetched: {
          ...this.state.fetched,
          f: true,
        },
        profilePics: Object.assign(this.state.profilePics, profilePics),
        profileAccounts: Object.assign(this.state.profileAccounts, profileAccounts),
      });
    }

    fireData.ref('feeds/' + this.props.uID).orderByChild('timestamp').limitToLast(40).once('value', (notifs)=>{
      setFollowingNotifications.call(this, notifs.val());
    })

  }

  _toggleFollow(notif){
    this.database.ref('/followers/' + notif.ownerID + '/' + notif.followingID).set(true);
    this.database.ref('/followings/' + notif.followingID + '/' + notif.ownerID).set(true);
    this.database.ref('/users/' + notif.ownerID + '/public/followerCount').transaction(currentFollowerCount => currentFollowerCount + 1);
    this.database.ref('/users/' + notif.followingID + '/public/followingCount').transaction(currentFollowingCount => currentFollowingCount + 1);

    const updateObj = {
      type: "follow",
      ownerID: notif.ownerID,
      ownerName: this.user.public.first_name + ' ' + this.user.public.last_name,
      ownerPicture: this.user.public.picture,
      followingID: notif.followingID,
      followingName: notif.ownerName,
      followingPicture: notif.ownerPicture,
      timestamp: Firebase.database.ServerValue.TIMESTAMP
    };

    saveUpdateToDB(updateObj, notif.followingID);
    this.props.FitlyFirebase.database().ref('/otherNotifications/' + notif.ownerID).push(updateObj);
  }

  _openProfile(id) {
    this.props.navigation.push({
      key: "ProfileEntry",
      passProps: {
        otherUID: id
      }
    })
  }

  _openPost(target, type) {
    // console.log(target, type);
    let targetID;
    if (type=== 'share') {
      type = target.contentType;
    }

    switch (type) {
      case 'post':
      targetID = target.contentID || target.sourceID;
      this.props.navigation.push({
          key: 'PostView@' + targetID,
          passProps: {
            postID: targetID
          }
        })
        break;
      case 'event':
      targetID = target.contentID || target.sourceID;
        let isAdmin;
        this.props.FitlyFirebase.database().ref(`events/${targetID}`).once('value', (event)=>{
           let data = event.val();
           isAdmin = data.organizers && !!data.organizers[this.props.uID] || false
         }).then(()=>{
           this.props.navigation.push({
             key: 'EventScene@' + targetID,
             passProps:{
               eventID: targetID,
               isAdmin: isAdmin}
             },
             {general: true})
         });
        break;
      default:
        console.log(target, type)
    }


    // target = target.split('/')
    // let targetId = target[2];
    // let targetType = target[1]==='post'|| target[1]==='posts' ?
    //     'PostView@'
    //   : target[1]==='event' || target[1]==='events' ? 'EventScene@' : '' ;
    // if(targetType == 'PostView@'){
    //   this.props.navigation.push({
    //     key: targetType + targetId,
    //     passProps: {
    //       postID: targetId
    //     }
    //   })
    // } else if (targetType == 'EventScene@') {
    //   let isAdmin;
    //   this.props.FitlyFirebase.database().ref(target.join('/'))
    //     .once('value', (event)=>{
    //       let data = event.val();
    //       isAdmin = data.organizers && !!data.organizers[this.props.uID] || false
    //     }).then(()=>{
    //       this.props.navigation.push({
    //         key: targetType + targetId,
    //         passProps:{
    //           eventID: targetId,
    //           isAdmin: isAdmin}
    //         },
    //         {general: true})
    //     });
    //
    // } else {
    //   console.log(target)
    // }
  }

  render() {
    if (this.props.navIndex.index===3){
      return (
        <View style={{flex: 1}}>
          <HeaderLocal sceneProps={this.props.sceneProps}/>

          <NotificationTabs
            notifsY={this.state.notificationsYou}
            notifsF={this.state.notificationsThem}
            openProfile={this._openProfile.bind(this)}
            openPost={this._openPost.bind(this)}
            fetched={this.state.fetched}
            profilePics={this.state.profilePics}
            profileAccounts={this.state.profileAccounts}
            FitlyFirebase={this.props.FitlyFirebase}
            toggleFollow={this._toggleFollow.bind(this)}/>
        </View>
      );
    } else {
      return <Text>Has not rendered</Text>
    }
  }
};

const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase,
    loading: state.app.loading,
    navIndex: state.navState.tabs
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    navigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
