import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableHighlight,
  ActivityIndicator,
  InteractionManager,
  Alert,
  Dimensions
} from 'react-native';
import FeedTabs from '../common/FeedTabs.js';
import { profileStyle, FitlyBlue } from '../styles/styles.js';
import { push, pop } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  saveUpdateToDB,
  turnOnfeedService,
  turnOffeedService,
  blockUser
} from '../library/firebaseHelpers.js';
import Firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import HeaderInView from '../header/HeaderInView.js';
import Icon from 'react-native-vector-icons/Ionicons';
import BlurImage from 'react-native-blur-image';
import Menu, {
  MenuContext,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-menu';

const { width, height } = Dimensions.get('window');

class ProfileEntry extends Component {
  constructor(props) {
    super(props);
    //props will have a otherUID attribute which holds the uID of the other user
    this.state = {
      loading: true,
      following: null,
      // TODO: create a local dummy profile and load it while the profile is being fetched from the database
      userProfile: null,
      feeds: [],
      menuOpen: false,
      ddMenuOpen: false
    };

    this.otherUID = this.props.navigation.state.params.otherUID;
    this.FitlyFirebase = this.props.FitlyFirebase;
    this.database = this.FitlyFirebase.database();
    this.userRef = this.database.ref('users/' + this.otherUID + '/public/');
    this.user = this.props.user;
    this.uID = this.props.uID;
    this.blocks = this.props.blocks || {};

    //when the current user follows another user, a notification entry will be created in the other user's notifications,
    //we dont want the users to spam notifications by constantly toggling the follow/unfollow button,
    //this marker will solve that by setting to true when the other user is notified
    this.hasSentFollowerUpdate = false;
  }

  componentDidMount() {
    // used so that you can't enter a users profile if they are blocked or you are blocked from them.
    if (this.blocks[this.otherUID]) this.props.navigation.goBack();

    InteractionManager.runAfterInteractions(() => {
      this._turnOnProfileWatcher();
      turnOnfeedService(
        this.otherUID,
        { self: false },
        feeds => this.setState({ feeds: feeds.reverse() }),
        newFeed => this.setState({ feeds: [newFeed].concat(this.state.feeds) })
      );
    });
  }

  componentWillUnmount() {
    this._turnOffProfileWatcher();
    turnOffeedService(this.otherUID, { self: false });
  }

  _turnOnProfileWatcher() {
    this.userRef.on('value', this._handleProfileChange.bind(this));
    this.database
      .ref('/followings/' + this.uID + '/' + this.otherUID)
      .on('value', this._handleFollowingChange.bind(this));
  }

  _turnOffProfileWatcher() {
    this.userRef.off('value');
    this.database
      .ref('/followings/' + this.uID + '/' + this.otherUID)
      .off('value');
  }

  _handleProfileChange(userProfile) {
    setTimeout(() => {
      this.setState({
        loading: false,
        userProfile: userProfile.val()
      });
    }, 2000);
  }

  _handleFollowingChange(following) {
    this.setState({
      following: !!following.val()
    });
  }

  _toggleFollow() {
    if (this.state.following) {
      this.database
        .ref('/followings/' + this.uID + '/' + this.otherUID)
        .set(null);
      this.database
        .ref('/followers/' + this.otherUID + '/' + this.uID)
        .set(null);
      this.database
        .ref('/users/' + this.otherUID + '/public/followerCount')
        .transaction(currentFollowerCount => currentFollowerCount - 1);
      this.database
        .ref('/users/' + this.uID + '/public/followingCount')
        .transaction(currentFollowingCount => currentFollowingCount - 1);
    } else {
      this.database
        .ref('/followings/' + this.uID + '/' + this.otherUID)
        .set(true);
      this.database
        .ref('/followers/' + this.otherUID + '/' + this.uID)
        .set(true);
      this.database
        .ref('/users/' + this.otherUID + '/public/followerCount')
        .transaction(currentFollowerCount => currentFollowerCount + 1);
      this.database
        .ref('/users/' + this.uID + '/public/followingCount')
        .transaction(currentFollowingCount => currentFollowingCount + 1);
      if (!this.hasSentFollowerUpdate) {
        const updateObj = {
          type: 'follow',
          ownerID: this.uID,
          ownerName:
            this.user.public.first_name + ' ' + this.user.public.last_name,
          ownerPicture: this.user.public.picture,
          followingID: this.otherUID,
          followingName:
            this.state.userProfile.first_name +
            ' ' +
            this.state.userProfile.last_name,
          followingPicture: this.state.userProfile.picture,
          timestamp: Firebase.database.ServerValue.TIMESTAMP
        };
        saveUpdateToDB(updateObj, this.uID);
        this.FitlyFirebase.database()
          .ref('/otherNotifications/' + this.otherUID)
          .push(updateObj);
        this.hasSentFollowerUpdate = true;
      }
    }
  }

  _renderCenteredText(text, styles) {
    return <Text style={[profileStyle.centeredText, styles]}>{text}</Text>;
  }

  _renderDropDown(color) {
    return (
      <TouchableHighlight
        onPress={this._openDDMenu.bind(this)}
        style={[
          profileStyle.followBtnDD,
          {
            backgroundColor: color,
            position: 'absolute',
            right: -20,
            width: 20,
            alignItems: 'center'
          }
        ]}
      >
        <View>
          <Icon name="md-arrow-dropdown" size={20} color={'white'} />
        </View>
      </TouchableHighlight>
    );
  }

  _openDDMenu() {
    this.setState({ ddMenuOpen: !this.state.ddMenuOpen });
  }

  _renderDDMenu() {
    let right = (width - 210) / 2;
    return (
      <View
        style={{
          position: 'absolute',
          top: 260,
          right: right,
          borderColor: '#aaa',
          borderWidth: 1,
          flex: 1,
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'visible',
          backgroundColor: '#fff',
          width: 100,
          padding: 5,
          shadowColor: 'black',
          shadowOpacity: 0.6,
          elevation: 2,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 2
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this._openDDMenu();
            this._message();
          }}
        >
          <Text style={{ padding: 2 }}>Message</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 5, borderColor: '#aaa', borderWidth: 1 }} />
        <TouchableOpacity
          onPress={() => {
            this._openDDMenu();
            this.props.screenProps.rootNavigation.navigate('ReportScene', {
              type: 'user',
              details: this.state.userProfile,
              contentID: this.otherUID
            });
          }}
        >
          <Text style={{ padding: 2 }}>Report...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this._openDDMenu();
            this._alert();
          }}
        >
          <Text style={{ padding: 2 }}>Block</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderFollowBtn() {
    const profile = this.state.userProfile;
    if (this.state.following) {
      return (
        <View>
          <TouchableHighlight
            style={[profileStyle.followBtn, { backgroundColor: 'green' }]}
            onPress={() => this._toggleFollow()}
          >
            {this._renderCenteredText('Following', {
              color: 'white',
              fontSize: 17
            })}
          </TouchableHighlight>
          {this._renderDropDown('green')}
        </View>
      );
    } else {
      return (
        <View>
          <TouchableHighlight
            style={[profileStyle.followBtn, { marginLeft: -25 }]}
            onPress={() => this._toggleFollow()}
          >
            {this._renderCenteredText('Follow', {
              color: 'white',
              fontSize: 17
            })}
          </TouchableHighlight>
          {this._renderDropDown(FitlyBlue)}
        </View>
      );
    }
  }

  _message() {
    const contact = this.state.userProfile;
    this.props.screenProps.rootNavigation.navigate('Chat', {
      chatID: null,
      contactID: this.otherUID,
      profilePic: contact.picture,
      contact: contact.first_name + ' ' + contact.last_name,
      navigation: this.props.navigation
    });
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        rightElement={{ icon: 'ios-more' }}
        title="Profile Entry"
        _onPressLeft={() => this.props.navigation.goBack()}
        _onPressRight={this._openMenu.bind(this)}
      />
    );
  }

  _openMenu() {
    this.setState({ menuOpen: !this.state.menuOpen });
  }

  _renderMenu() {
    return (
      <View
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          borderColor: '#aaa',
          borderWidth: 1,
          flex: 1,
          flexDirection: 'column',
          zIndex: 200,
          backgroundColor: '#fff',
          width: 100,
          padding: 5,
          shadowColor: 'black',
          shadowOpacity: 0.6,
          elevation: 2,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 2
        }}
      >
        <TouchableOpacity
          onPress={() => {
            console.log('SCREEN PROPS', this.props.screenProps);
            this._openMenu();
            this.props.screenProps.rootNavigation.navigate('ReportScene', {
              type: 'user',
              details: this.state.userProfile,
              contentID: this.otherUID
            });
          }}
        >
          <Text style={{ margin: 5 }}>Report...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this._openMenu();
            this._alert();
          }}
        >
          <Text style={{ margin: 5 }}>Block</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _alert() {
    Alert.alert(
      '',
      'Are you sure you want to block this user?',
      [
        { text: 'No', onPress: () => console.log('no'), style: 'cancel' },
        { text: 'Yes', onPress: () => blockUser(this.props.uID, this.otherUID) }
      ],
      { cancelable: false }
    );
  }

  render() {
    const profile = this.state.userProfile;
    // TODO: create a local dummy profile and load it while the profile is being fetched from the database
    return (
      <View style={{ flex: 1 }}>
        {this._renderHeader()}
        <View style={{ flex: 1, zIndex: 0 }}>
          {this.state.menuOpen ? this._renderMenu() : <View />}
          {this.state.loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 60
              }}
            >
              {/*<Text>Loading profile</Text>*/}
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <ScrollView
              bounces={false}
              onScroll={() => {
                if (this.state.ddMenuOpen) {
                  this.setState({ ddMenuOpen: false });
                }
                if (this.state.menuOpen) {
                  this.setState({ menuOpen: false });
                }
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                profileStyle.container,
                { minHeight: height }
              ]}
            >
              <BlurImage
                source={profile.picture ? { uri: profile.picture } : null}
                blurRadius={25}
                style={{ width: width, height: 267, position: 'absolute' }}
              />
              <Image
                source={
                  profile.picture
                    ? { uri: profile.picture }
                    : require('../../img/default-user-image.png')
                }
                style={[
                  profile.account === 'trainer'
                    ? profileStyle.trainerImg
                    : profileStyle.defaultImg,
                  { borderColor: profile.picture ? '#fff' : FitlyBlue }
                ]}
              />
              <Text
                style={[
                  profileStyle.nameText,
                  {
                    backgroundColor: 'transparent',
                    color: profile.picture ? '#fff' : '#000'
                  }
                ]}
              >
                {profile.first_name + ' ' + profile.last_name}
              </Text>
              <Text
                style={[
                  profileStyle.dashboardText,
                  {
                    backgroundColor: 'transparent',
                    color: profile.picture ? '#fff' : '#aaa'
                  }
                ]}
              >
                {profile.userCurrentLocation.place}
              </Text>
              <Text
                style={{
                  backgroundColor: 'transparent',
                  color: profile.picture ? '#fff' : '#000'
                }}
              >
                {profile.summary
                  ? profile.summary
                  : `I haven't filled this in yet`}
              </Text>
              {this.state.ddMenuOpen ? this._renderDDMenu() : <View />}
              {this._renderFollowBtn()}
              {
                // <TouchableHighlight style={[profileStyle.followBtn, {width: 120, margin: 10}]} onPress={() => this._message()}>
                //   {this._renderCenteredText("Message", {color: "white", fontSize: 17})}
                // </TouchableHighlight>
              }

              {/* below is the same as ProfileView */}
              <View style={profileStyle.dashboard}>
                <TouchableWithoutFeedback style={profileStyle.dashboardItem}>
                  <View>
                    {this._renderCenteredText(
                      profile.sessionCount,
                      profileStyle.dashboardTextColor
                    )}
                    {this._renderCenteredText(
                      'SESSIONS',
                      profileStyle.dashboardText
                    )}
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback style={profileStyle.dashboardItem}>
                  <View>
                    {this._renderCenteredText(
                      profile.followerCount,
                      profileStyle.dashboardTextColor
                    )}
                    {this._renderCenteredText(
                      'FOLLOWERS',
                      profileStyle.dashboardText
                    )}
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback style={profileStyle.dashboardItem}>
                  <View>
                    {this._renderCenteredText(
                      profile.followingCount,
                      profileStyle.dashboardTextColor
                    )}
                    {this._renderCenteredText(
                      'FOLLOWING',
                      profileStyle.dashboardText
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <FeedTabs
                navigation={this.props.navigation}
                feeds={this.state.feeds}
                profile={true}
                viewing={this.otherUID}
              />
              {/* <View style={{height: 100}}></View> */}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase,
    blocks: state.blocks.blocks
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push, pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileEntry);
