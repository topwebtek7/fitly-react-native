import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  InteractionManager,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import BlurImage from 'react-native-blur-image';
import FeedTabs from '../../common/FeedTabs.js';
import { profileStyle } from '../../styles/styles.js';
import { storeUserProfile } from '../../actions/user.js';
import { save, clear } from '../../actions/drafts.js';
import { push, pop } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Prompt from 'react-native-prompt';
import {
  selectPictureCropper,
  selectPicture
} from '../../library/pictureHelper.js';
import {
  uploadPhoto,
  turnOnfeedService,
  turnOffeedService
} from '../../library/firebaseHelpers.js';
import Icon from 'react-native-vector-icons/Ionicons';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import HeaderProfile from '../../header/HeaderProfile';
import NewEventIcon from '../../common/NewEventIcon';
import Menu, {
  MenuContext,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-menu';
import { randomString } from '../../library/firebaseHelpers.js';

import FAIcons from 'react-native-vector-icons/FontAwesome';

import { StackNavigator } from 'react-navigation';
import ComposePost from '../../common/post/ComposePost.js';
import CreateActivityScene from '../../common/activity/CreateActivityScene.js';
import SessionView from '../../common/workoutSession/SessionView.js';
import UserListView from '../../common/UserListView.js';
import SessionListView from '../../common/workoutSession/SessionListView.js';
import ProfileEntry from '../../common/ProfileEntry';
import PostImagesView from '../../common/PostImagesView';
import PostView from '../../common/post/PostView';
import ImageView from '../../common/ImageView';
import ProfilePicsView from '../../common/ProfilePicsView';
import EventScene from '../../common/activity/EventScene';
import SelectDateScene from '../../common/activity/SelectDateScene';
import SelectLocationScene from '../../common/activity/SelectLocationScene';
import EventOptionsMenu from '../../common/activity/EventOptionsMenu';

const { width, height } = Dimensions.get('window');
const bar = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      othersFeed: [],
      feed: [],
      summaryEditMode: false,
      summaryInput: '',
      optionsOpen: false,
      blurHeight: 226
    };
  }

  // register listener to update the othersFeed, and follower count
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._turnOnProfileWatcher();
      turnOnfeedService(
        this.props.uID,
        { self: false },
        feed => this.setState({ feed: feed.reverse() }),
        newFeed => this.setState({ feed: [newFeed].concat(this.state.feed) })
      );
      turnOnfeedService(
        this.props.uID,
        { self: true },
        othersFeed => this.setState({ othersFeed: othersFeed.reverse() }),
        newFeed =>
          this.setState({ othersFeed: [newFeed].concat(this.state.othersFeed) })
      );
    });
  }

  componentWillUnmount() {
    this._turnOffProfileWatcher();
    turnOffeedService(this.props.uID, { self: true });
  }

  _turnOnProfileWatcher() {
    const handleProfileChange = snapshot => {
      // const {private: privateData} = this.props.user;
      const data = snapshot.val();
      // TODO: get push notification for updates in follower and following
      this.props.action.storeUserProfile({
        private: data.private,
        public: data.public
      });
    };
    this.props.FitlyFirebase.database()
      .ref(`users/${this.props.uID}`)
      .on('value', handleProfileChange.bind(this));
  }

  _turnOffProfileWatcher() {
    this.props.FitlyFirebase.database()
      .ref(`users/${this.props.uID}/public/`)
      .off('value');
  }

  _renderCenteredText(text, styles) {
    return <Text style={[profileStyle.centeredText, styles]}>{text}</Text>;
  }

  _updateSummary(value) {
    this.props.FitlyFirebase.database()
      .ref(`users/${this.props.uID}/public/summary`)
      .set(value);
    this.setState({ summaryEditMode: false });
  }

  _renderSummary(profile) {
    return (
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          width: width - 32
        }}
      >
        <Prompt
          title="Change summary"
          placeholder="say a little about yourself!"
          defaultValue={profile.summary ? profile.summary : null}
          visible={this.state.summaryEditMode}
          onCancel={() =>
            this.setState({
              summaryEditMode: false
            })
          }
          onSubmit={value => {
            this._updateSummary(value);
          }}
        />
        <Text
          style={[
            profileStyle.summaryText,
            profile.picture
              ? { backgroundColor: 'transparent', color: '#fff' }
              : {}
          ]}
          numberOfLines={1}
        >
          {profile.summary
            ? profile.summary
            : `I haven't filled this in yet...`}
        </Text>
        <Text
          style={[
            profileStyle.summaryTextEdit,
            profile.picture ? { backgroundColor: 'transparent' } : {}
          ]}
          onPress={() =>
            this.setState({ summaryEditMode: !this.state.summaryEditMode })
          }
        >
          <Icon
            name="md-create"
            color={profile.picture ? '#fff' : 'gray'}
            size={15}
            style={{ backgroundColor: 'transparent' }}
          />
        </Text>
      </View>
    );
  }

  _openOptions() {
    this.setState({
      optionsOpen: !this.state.optionsOpen
    });
  }

  _composePost() {
    const draftRef = randomString();
    this.props.draftsAction.save(draftRef, {
      category: 'Workout Plan',
      title: '',
      content: '',
      tags: [],
      photos: [],
      photoRefs: null
    });

    this.props.navigation.navigate('ComposePost', {
      draftRef
    });
  }

  _renderModal() {
    return (
      <Modal
        animationType={'fade'}
        transparent
        visible={this.state.optionsOpen}
        onRequestClose={() => this._openOptions()}
      >
        <TouchableWithoutFeedback onPress={this._openOptions.bind(this)}>
          <View
            style={{
              flexGrow: 1,
              width,
              height: height - bar,
              alignSelf: 'stretch',
              position: 'absolute',
              zIndex: 90,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          >
            <TouchableOpacity
              style={[profileStyle.blueBtn, { right: 25, bottom: 120 }]}
              onPress={() => {
                this._openOptions();
                this.props.screenProps.rootNavigation.navigate(
                  'CreateActivityScene'
                );
              }}
            >
              <NewEventIcon iconSize={30} color={'white'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[profileStyle.blueBtn, { right: 72, bottom: 65 }]}
              onPress={() => {
                this._composePost();
                this._openOptions();
              }}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>
                <Icon name="ios-create-outline" size={30} color="white" />
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  _renderProfilePicsView = () => {
    this.props.navigation.navigate('ProfilePicsView', {
      uID: this.props.uID,
      navigation: this.props.navigation
    });
  };

  _updateProfilePic = () => {
    selectPicture()
      .then(picture => this._storePhoto(picture.uri))
      //.then(picture => console.log(picture))
      .catch(err => console.log(err));
  };

  _storePhoto = uri => {
    this.setState({ loading: true });
    uploadPhoto(`users/${this.props.uID}/profilePic/`, uri, {
      profile: false
    })
      .then(link => {
        this.props.FitlyFirebase.database()
          .ref(`users/${this.props.uID}/public/picture`)
          .set(link);
        return link;
      })
      .then(link => {
        this.props.FitlyFirebase.database()
          .ref(`users/${this.props.uID}/public/profilePictures`)
          .push()
          .set(link);
        this.setState({ loading: false });
      })
      .catch(error => {
        this.setState({ loading: false });
        console.log('upload profile pic', error);
      });
  };

  // this function should be a reusable component
  render() {
    const { public: profile } = this.props.user;
    return (
      <View style={{ flex: 1 }}>
        <HeaderProfile
          navigator={this.props.screenProps.rootNavigation}
          sceneProps={this.props.sceneProps}
        />

        <View style={{ flex: 1, backgroundColor: '#fff', width }}>
          <TouchableOpacity
            style={[
              profileStyle.blueBtn,
              { bottom: 15, width: 55, height: 55 }
            ]}
            onPress={this._openOptions.bind(this)}
          >
            <View>
              <Icon color="#fff" size={40} name="md-add" />
            </View>
          </TouchableOpacity>

          {this._renderModal()}

          <ScrollView
            bounces={false}
            style={{ flex: 1 }}
            contentContainerStyle={profileStyle.container}
            showsVerticalScrollIndicator={false}
          >
            <BlurImage
              source={profile.picture ? { uri: profile.picture } : null}
              style={{
                position: 'absolute',
                height: this.state.blurHeight,
                width: width
              }}
              blurRadius={25}
            />
            <TouchableOpacity onPress={this._renderProfilePicsView}>
              <Image
                source={
                  profile.picture
                    ? { uri: profile.picture }
                    : require('../../../img/default-user-image.png')
                }
                style={[
                  profileStyle[`${profile.account}Img`],
                  { borderColor: !profile.picture ? '#1D2F7B' : '#fff' }
                ]}
                defaultSource={require('../../../img/default-user-image.png')}
              />
              <TouchableOpacity
                style={[
                  profileStyle.updateProfileBtn,
                  profile.picture
                    ? {
                        borderWidth: 1,
                        borderColor: '#1D2F7B',
                        backgroundColor: '#fff'
                      }
                    : {}
                ]}
                onPress={this._updateProfilePic}
              >
                <Icon
                  color={profile.picture ? '#1D2F7B' : '#fff'}
                  size={20}
                  name="md-add"
                />
              </TouchableOpacity>
              {this.state.loading ? (
                <ActivityIndicator
                  animating={this.state.loading}
                  size="small"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    marginTop: 20
                  }}
                />
              ) : null}
            </TouchableOpacity>
            <Text
              style={[
                profileStyle.nameText,
                {
                  backgroundColor: 'transparent',
                  color: profile.picture ? '#fff' : '#000'
                }
              ]}
            >
              {`${profile.first_name} ${profile.last_name}`}
            </Text>
            <View style={profileStyle.locationContainer}>
              <Icon
                name="ios-pin-outline"
                size={30}
                color={profile.picture ? '#fff' : 'gray'}
                style={{ backgroundColor: 'transparent' }}
              />
              <Text
                style={[
                  profileStyle.dashboardText,
                  {
                    marginLeft: 5,
                    zIndex: 1,
                    backgroundColor: 'transparent',
                    color: profile.picture ? '#fff' : 'gray'
                  }
                ]}
              >
                {profile.userCurrentLocation.place}
              </Text>
            </View>
            {this._renderSummary(profile)}

            {/* below is the same as ProfileEntryView */}
            <View style={profileStyle.dashboard}>
              <TouchableOpacity
                style={profileStyle.dashboardItem}
                onPress={() => {
                  this.props.navigation.navigate('SessionListView', {
                    uID: this.props.uID
                  });
                }}
              >
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
              </TouchableOpacity>

              <TouchableOpacity
                style={profileStyle.dashboardItem}
                onPress={() => {
                  this.props.navigation.navigate('UserListView', {
                    userType: 'Followers',
                    uID: this.props.uID,
                    dbRef: 'followers',
                    navigation: this.props.navigation
                  });
                }}
              >
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
              </TouchableOpacity>

              <TouchableOpacity
                style={profileStyle.dashboardItem}
                onPress={() =>
                  this.props.navigation.navigate('UserListView', {
                    userType: 'Following',
                    uID: this.props.uID,
                    dbRef: 'followings',
                    navigation: this.props.navigation
                  })
                }
              >
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
              </TouchableOpacity>
            </View>
            <View style={profileStyle.container}>
              <FeedTabs
                navigation={this.props.navigation}
                feeds={this.state.feed}
                profile
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    loading: state.app.loading,
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ storeUserProfile }, dispatch),
    exnavigation: bindActionCreators({ push, pop }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

const ConnectedProfile = connect(mapStateToProps, mapDispatchToProps)(Profile);

const profileRoute = {
  Profile: { screen: ConnectedProfile },
  ComposePost: { screen: ComposePost },
  SessionListView: { screen: SessionListView },
  CreateActivityScene: { screen: CreateActivityScene },
  SessionView: { screen: SessionView },
  UserListView: { screen: UserListView },
  ProfileEntry: { screen: ProfileEntry },
  PostImagesView: { screen: PostImagesView },
  PostView: { screen: PostView },
  ImageView: { screen: ImageView },
  ProfilePicsView: { screen: ProfilePicsView },
  EventScene: { screen: EventScene },
  SelectDateScene: { screen: SelectDateScene },
  SelectLocationScene: { screen: SelectLocationScene },
  EventOptionsMenu: { screen: EventOptionsMenu }
};

const ProfileStackNavigation = StackNavigator(profileRoute, {
  headerMode: 'none',
  initialRouteName: 'Profile'
});

class ProfileNavigationWrapper extends React.Component {
  static navigationOptions = {
    tabBarIcon: () => <FAIcons name="user" size={24} color="white" />
  };

  render() {
    const { navigation, screenProps } = this.props;
    const { rootNavigation } = screenProps;
    const navigationPropsToPass = {
      tabNavigation: navigation,
      rootNavigation
    };

    return <ProfileStackNavigation screenProps={navigationPropsToPass} />;
  }
}

export default ProfileNavigationWrapper;
// export default connect(mapStateToProps, mapDispatchToProps)(Profile);
