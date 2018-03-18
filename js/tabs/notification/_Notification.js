import React, { Component } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { commonStyle, FitlyBlue } from '../../styles/styles.js';
import { resetTo } from '../../actions/navigation.js';
import LogoutBtn from '../../common/LogoutBtn.js';
import { push } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Firebase from 'firebase';
import FAIcons from 'react-native-vector-icons/FontAwesome';
import { saveUpdateToDB } from '../../library/firebaseHelpers.js';
import HeaderLocal from '../../header/HeaderLocal';

import NotificationTabs from './NotificationTabs.js';

// Views
import ProfileEntry from '../../common/ProfileEntry';
import PostImagesView from '../../common/PostImagesView';
import PostView from '../../common/post/PostView';
import ImageView from '../../common/ImageView';
import EventScene from '../../common/activity/EventScene';

import { StackNavigator, NavigationActions } from 'react-navigation';

class Notification extends Component {
  static navigationOptions = ({ navigation }) => ({});

  constructor(props) {
    super(props);
    this.state = {
      listenerY: false,
      listenerF: false,
      notificationsYou: [],
      notificationsThem: [],
      fetched: {
        y: false,
        f: false
      },
      profilePics: {},
      profileAccounts: {}
    };
    this.database = this.props.FitlyFirebase.database();
    this.user = this.props.user;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._turnOnYouNotificationWatcher();
      this._turnOnFollowingNotificationWatcher();
    });
  }

  _getImage(loc) {
    let image;
    const postRef = this.props.FitlyFirebase.database().ref(loc);

    postRef.once('value', s => {
      const post = s.val();
      if (post && post.backgroundImage) {
        return post.backgroundImage;
      } else if (post && post.photos) {
        // console.log(post.photos)
      } else {
        image = false;
      }
      console.log(image);
      return image;
    });
  }

  _turnOnYouNotificationWatcher() {
    const fireData = this.props.FitlyFirebase.database();
    fireData
      .ref('/otherNotifications/' + this.props.uID)
      .on('child_added', child => {
        if (!this.state.listenerY) return;
        console.log('child_added', child.val());
        this.setState({
          notificationsYou: [child.val(), ...this.state.notificationsYou]
        });
      });

    const setYouNotifications = function(notifs) {
      let notifications = [];
      let lastNotif;
      const profilePics = Object.assign({}, this.state.profilePics);
      const profileAccounts = Object.assign({}, this.state.profileAccounts);

      notifs &&
        Object.keys(notifs).forEach((k, i) => {
          // this._getImage(k)
          const notif = notifs[k];
          // console.log(notif);
          if (!profileAccounts[notif.ownerID])
            profileAccounts[notif.ownerID] = 'default';
          if (!profilePics[notif.ownerID]) {
            fireData
              .ref('users/' + notif.ownerID + '/public')
              .once('value', data => {
                profilePics[notif.ownerID] = data.val().picture;
                profileAccounts[notif.ownerID] = data.val().account;
              });
          }
          if (notif.type === 'follow') {
            fireData
              .ref(`followings/${notif.followingID}/${notif.ownerID}`)
              .once('value', d => {
                const data = d.val();
                if (data) {
                  notif.following = true;
                } else {
                  notif.following = false;
                }
                notifications = [notif, ...notifications];
                if (!i) lastNotif = k;

                this.setState({
                  listenerY: true,
                  notificationsYou: notifications,
                  lastYouNotification: lastNotif,
                  fetched: {
                    ...this.state.fetched,
                    y: true
                  },
                  profilePics: Object.assign(
                    this.state.profilePics,
                    profilePics
                  ),
                  profileAccounts: Object.assign(
                    this.state.profileAccounts,
                    profileAccounts
                  )
                });
              });
          } else {
            notifications = [notif, ...notifications];
            if (!i) lastNotif = k;

            this.setState({
              listenerY: true,
              notificationsYou: notifications,
              lastYouNotification: lastNotif,
              fetched: {
                ...this.state.fetched,
                y: true
              },
              profilePics: Object.assign(this.state.profilePics, profilePics)
            });
          }
        });
    };

    fireData
      .ref('/otherNotifications/' + this.props.uID)
      .orderByChild('timestamp')
      .limitToLast(20)
      .once('value', notifs => {
        setYouNotifications.call(this, notifs.val());
      });
  }

  _turnOnFollowingNotificationWatcher() {
    const fireData = this.props.FitlyFirebase.database();
    fireData.ref(`feeds/${this.props.uID}`).on('child_added', added_child => {
      if (!this.state.listenerF) return;
      const child = added_child.val();
      child.notifImage = this._getImage(child.contentlink);
      this.setState({
        notificationsYou: [child, ...this.state.notificationsYou]
      });
    });

    const setFollowingNotifications = function(notifs) {
      const notifications = {};
      const fNotifs = [];
      let pointer = 0;
      const profilePics = Object.assign({}, this.state.profilePics);
      const profileAccounts = Object.assign({}, this.state.profileAccounts);

      notifs &&
        Object.keys(notifs)
          .reverse()
          .forEach(k => {
            let notif = notifs[k];

            if (!profileAccounts[notif.ownerID])
              profileAccounts[notif.ownerID] = 'default';

            if (!profilePics[notif.ownerID]) {
              fireData
                .ref('users/' + notif.ownerID + '/public')
                .once('value', data => {
                  profilePics[notif.ownerID] = data.val().picture;
                  profileAccounts[notif.ownerID] = data.val().account;
                });
            }
            if (notif.type !== 'follow') {
              if (notifications[notif.ownerID]) {
                if (
                  notifications[notif.ownerID][notif.type] === 0 ||
                  notifications[notif.ownerID][notif.type]
                ) {
                  const spot = notifications[notif.ownerID][notif.type];
                  fNotifs[spot].push(notif);
                } else {
                  notifications[notif.ownerID][notif.type] = pointer;
                  fNotifs[pointer] = [notif];
                  pointer++;
                }
              } else {
                notifications[notif.ownerID] = [notif.type];
                notifications[notif.ownerID][notif.type] = pointer;
                fNotifs[pointer] = [notif];
                pointer++;
              }
            }
          });
      this.setState({
        listenerF: true,
        notificationsThem: fNotifs,
        fetched: {
          ...this.state.fetched,
          f: true
        },
        profilePics: Object.assign(this.state.profilePics, profilePics),
        profileAccounts: Object.assign(
          this.state.profileAccounts,
          profileAccounts
        )
      });
    };

    fireData
      .ref('feeds/' + this.props.uID)
      .orderByChild('timestamp')
      .limitToLast(40)
      .once('value', notifs => {
        setFollowingNotifications.call(this, notifs.val());
      });
  }

  _toggleFollow(notif) {
    this.database
      .ref('/followers/' + notif.ownerID + '/' + notif.followingID)
      .set(true);
    this.database
      .ref('/followings/' + notif.followingID + '/' + notif.ownerID)
      .set(true);
    this.database
      .ref('/users/' + notif.ownerID + '/public/followerCount')
      .transaction(currentFollowerCount => currentFollowerCount + 1);
    this.database
      .ref('/users/' + notif.followingID + '/public/followingCount')
      .transaction(currentFollowingCount => currentFollowingCount + 1);

    const updateObj = {
      type: 'follow',
      ownerID: notif.ownerID,
      ownerName: `${this.user.public.first_name} ${this.user.public.last_name}`,
      ownerPicture: this.user.public.picture,
      followingID: notif.followingID,
      followingName: notif.ownerName,
      followingPicture: notif.ownerPicture,
      timestamp: Firebase.database.ServerValue.TIMESTAMP
    };

    saveUpdateToDB(updateObj, notif.followingID);
    this.props.FitlyFirebase.database()
      .ref('/otherNotifications/' + notif.ownerID)
      .push(updateObj);
  }

  _openProfile(id) {
    // console.log('GO', this.props.screenProps)
    console.log('_Notification');
    const isMyProfile = id === this.props.uID;

    if (isMyProfile) {
      return this.props.screenProps.tabNavigation.navigate('Profile');
    } else {
      this.props.navigation.navigate('Profile', { otherUID: id });
      this.props.navigation.navigate('ProfileEntry', { otherUID: id });
    }
  }

  _navigateToPost = postID => {
    console.log('LEL');
    this.props.navigation.navigate('PostView', { postID });

    // This solution currently is not working

    // const navigateToPostActions = NavigationActions.reset({
    //   index: 1,
    //   actions: [
    //     NavigationActions.navigate({routeName: "Profile"}),
    //     NavigationActions.navigate({routeName: "PostView", params: {postID}}),
    //   ],
    //   key: "TabBarNavigation"
    // })
    // this.props.screenProps.tabNavigation.dispatch(navigateToPostActions);
  };

  _openPost(target, type) {
    let targetID;
    if (type === 'share') {
      type = target.contentType;
    }

    switch (type) {
      case 'post':
        targetID = target.contentID || target.sourceID;
        this._navigateToPost(targetID);
        break;
      case 'event': {
        targetID = target.contentID || target.sourceID;
        let isAdmin;
        console.log('openPost');
        this.props.FitlyFirebase.database()
          .ref(`events/${targetID}`)
          .once('value', event => {
            const data = event.val();
            isAdmin =
              (data.organizers && !!data.organizers[this.props.uID]) || false;
          })
          .then(() => {
            this.props.screenProps.rootNavigation.navigate('EventScene', {
              eventID: targetID,
              isAdmin
            });
          });
        break;
      }
      default:
        console.log(target, type);
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <NotificationTabs
          notifsY={this.state.notificationsYou}
          notifsF={this.state.notificationsThem}
          openProfile={this._openProfile.bind(this)}
          openPost={this._openPost.bind(this)}
          fetched={this.state.fetched}
          profilePics={this.state.profilePics}
          profileAccounts={this.state.profileAccounts}
          FitlyFirebase={this.props.FitlyFirebase}
          toggleFollow={this._toggleFollow.bind(this)}
        />
      </View>
    );
  }
}

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
    exnavigation: bindActionCreators({ push }, dispatch)
  };
};

const ConnectedNotifications = connect(mapStateToProps, mapDispatchToProps)(
  Notification
);

const notificationRoutes = {
  Notification: {
    screen: ConnectedNotifications,
    navigationOptions: {
      header: () => {
        return (
          <View
            style={{
              height: 80,
              backgroundColor: FitlyBlue,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text
              style={{
                fontFamily: 'HelveticaNeue',
                fontWeight: '700',
                letterSpacing: -1,
                fontSize: 22,
                color: 'white',
                marginBottom: -10
              }}
            >
              Notifications
            </Text>
          </View>
        );
      }
    }
  },
  PostImagesView: {
    screen: PostImagesView,
    navigationOptions: {
      header: null
    }
  },
  PostView: {
    screen: PostView,
    navigationOptions: {
      header: null
    }
  },
  ProfileEntry: {
    screen: ProfileEntry,
    navigationOptions: {
      header: null
    }
  },
  ImageView: {
    screen: ImageView,
    navigationOptions: {
      header: null
    }
  },
  EventScene: {
    screen: EventScene,
    navigationOptions: {
      header: null
    }
  }
};

const NotificationStackNavigator = StackNavigator(notificationRoutes, {
  initialRouteName: 'Notification'
});

class StackNavigationWrapper extends React.Component {
  static navigationOptions = {
    tabBarIcon: () => <FAIcons name="bell-o" size={24} color="white" />
  };

  render() {
    const { navigation, screenProps } = this.props;
    const { rootNavigation } = screenProps;

    const tabNavigatorScreenProps = {
      tabNavigation: navigation,
      rootNavigation
    };
    return <NotificationStackNavigator screenProps={tabNavigatorScreenProps} />;
  }
}

export default StackNavigationWrapper;
