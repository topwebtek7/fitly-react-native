import React, { Component } from 'react';
import { Alert, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, InteractionManager, Dimensions, TouchableWithoutFeedback, Modal, StatusBar, Platform } from 'react-native';
// import Feeds from '../../common/Feeds.js'
import FeedTabs from '../../common/FeedTabs.js'
import { profileStyle } from '../../styles/styles.js';
import { storeUserProfile } from '../../actions/user.js';
import { save, clear } from '../../actions/drafts.js';
import { push, pop } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { selectPicture, selectPictureCropper } from '../../library/pictureHelper.js';
import { uploadPhoto, turnOnfeedService, turnOffeedService } from '../../library/firebaseHelpers.js';
import Icon from 'react-native-vector-icons/Ionicons';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js'
import HeaderProfile from '../../header/HeaderProfile'
import NewEventIcon from '../../common/NewEventIcon'
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import {randomString} from '../../library/firebaseHelpers.js'

const { width, height } = Dimensions.get('window')
const bar = (Platform.OS === 'android') ? StatusBar.currentHeight : 0;

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
    }
  }

  //register listener to update the othersFeed, and follower count
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._turnOnProfileWatcher();
      turnOnfeedService(this.props.uID, {self: false},
        (feed) => this.setState({feed: feed.reverse()}),
        (newFeed) => this.setState({feed: [newFeed].concat(this.state.feed)})
      )
      turnOnfeedService(this.props.uID, {self: true},
        (othersFeed) => this.setState({othersFeed: othersFeed.reverse()}),
        (newFeed) => this.setState({othersFeed: [newFeed].concat(this.state.othersFeed)})
      );
    });
  }

  componentWillUnmount() {
    this._turnOffProfileWatcher();
    turnOffeedService(this.props.uID, {self: true});
  };

  _turnOnProfileWatcher() {
    const handleProfileChange = (snapshot) => {
      // const {private: privateData} = this.props.user;
      const data = snapshot.val();
      // TODO: get push notification for updates in follower and following
      this.props.action.storeUserProfile({private: data.private, public: data.public});
    };
    this.props.FitlyFirebase.database().ref('users/' + this.props.uID).on('value', handleProfileChange.bind(this));
  };

  _turnOffProfileWatcher() {
    this.props.FitlyFirebase.database().ref('users/' + this.props.uID + '/public/').off('value');
  };

  _renderCenteredText(text, styles) {
    return (
      <Text style={[profileStyle.centeredText, styles]}>{text}</Text>
    );
  };

  _updateSummary() {
    this.props.FitlyFirebase.database().ref('users/' + this.props.uID + '/public/summary').set(this.state.summaryInput);
    this.setState({summaryInput: '', summaryEditMode: false});
  }

  _renderSummary(profile) {
    if (this.state.summaryEditMode) {
      return (
        <View style={{alignItems:'center'}}>
          <AutoExpandingTextInput
            style={profileStyle.summaryTextBox}
            multiline={true}
            maxLength={100}
            clearButtonMode="always"
            onSubmitEditing={() => this._updateSummary()}
            onChangeText={(text) => this.setState({summaryInput: text})}
            value={this.state.summaryInput}
            placeholder="say a little about yourself!"
          />
          <Text style={profileStyle.summaryTextBtn} onPress={() => this._updateSummary()}>send</Text>
          <Text style={profileStyle.summaryTextBtn} onPress={() => this.setState({summaryEditMode: !this.state.summaryEditMode, summaryInput: ''})}>close</Text>
        </View>
      );
    } else {
      return (
        <View style={{alignItems:'center', flexDirection: 'row'}}>
          <Text style={profileStyle.summaryText}>{(profile.summary) ? profile.summary : `I haven't filled this in yet...`}</Text>
          <Text
            style={profileStyle.summaryTextEdit}
            onPress={() => this.setState({summaryEditMode: !this.state.summaryEditMode})}>
            <Icon name="md-create" color="#aaa" size={15}/>
          </Text>
        </View>
      );
    }
  }

  _updateProfilePic() {
    
    // selectPicture()
    selectPictureCropper()
    .then(picture => {
      this.setState({loading: true});
      return uploadPhoto('users/' + this.props.uID + '/profilePic/', picture.uri, {profile: true});
    })
    .then(link => this.props.FitlyFirebase.database().ref('users/' + this.props.uID + '/public/picture').set(link))
    .then(snap => this.setState({loading: false}))
    .catch(error => {
      this.setState({loading: false});
      console.log("update profile pic", error)
    });
  };

  _openOptions(){
    this.setState({
      optionsOpen: !this.state.optionsOpen
    })
  }

  _composePost(){
    let draftRef = randomString();
    this.props.draftsAction.save(draftRef,{
      category: 'Workout Plan',
      title: '',
      content: '',
      tags: [],
      photos: [],
      photoRefs: null,
    })

    this.props.navigation.push({
      key: 'ComposePost',
      global: true,
      passProps:{
        draftRef: draftRef
      }
    });
  }

  _renderModal(){

    return(
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={this.state.optionsOpen}
        onRequestClose={() => this._openOptions()}>

        <TouchableWithoutFeedback
          onPress={this._openOptions.bind(this)}
          >
          <View style={{flexGrow: 1, width: width, height: height-bar, alignSelf: 'stretch', position: 'absolute', zIndex: 90,  backgroundColor: 'rgba(0,0,0,0.5)'}}>

            <TouchableOpacity
              style={[profileStyle.blueBtn, {right: 25, bottom: 120}]}
              onPress={() => {
                this._openOptions();
                this.props.navigation.push({key: "CreateActivityScene", global: true});
              }}>
              <NewEventIcon
                iconSize={30}
                color={'white'}/>
            </TouchableOpacity>

            <TouchableOpacity
              style={[profileStyle.blueBtn, {right: 72, bottom: 65}]}
              onPress={() => {
                this._composePost();
                this._openOptions();
              }}>
              <Text style={{color: 'white', fontSize: 20}}>
                <Icon
                  name="ios-create-outline"
                  size={30}
                  color="white"/>
              </Text>
            </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>

      </Modal>
    )
  }

  //this function should be a reusable component
  render() {
    const {public: profile} = this.props.user;
    return (
      <View style={{flex: 1}}>
        <HeaderProfile sceneProps={this.props.sceneProps}/>

        <ScrollView
          horizontal={true}
          pagingEnabled={true}>
          <View style={{flex: 1, backgroundColor: '#fff', width: width}}>
            <TouchableOpacity
              style={[profileStyle.blueBtn, {width: 55, height: 55}]}
              onPress={this._openOptions.bind(this)}>
              <View style={{alignSelf: 'center', paddingTop: 3}}>
                <Icon color='#fff' size={40} name="md-add" />
              </View>
            </TouchableOpacity>

            {this._renderModal()}

          <ScrollView style={{flex:1}} contentContainerStyle={profileStyle.container}>
            <TouchableOpacity onPress={() => this._updateProfilePic()}>
              <Image source={(profile.picture) ? {uri:profile.picture} : require('../../../img/default-user-image.png')}
              style={profileStyle[profile.account+"Img"]} defaultSource={require('../../../img/default-user-image.png')}>
                {(this.state.loading)
                  ? <ActivityIndicator animating={this.state.loading} style={[profileStyle[profile.account+"Img"], {height: 30}]} size="small"/>
                : null
                }
              </Image>
            </TouchableOpacity>
            <Text
              style={profileStyle.nameText}>
              {profile.first_name + ' ' + profile.last_name}
            </Text>
            <View style={profileStyle.locationContainer}>
              <Icon name="ios-pin-outline" size={30} color="grey"/>
              <Text style={[profileStyle.dashboardText, {marginLeft: 5}]}>{profile.userCurrentLocation.place}</Text>
            </View>
            {this._renderSummary(profile)}

            {/* below is the same as ProfileEntryView */}
            <View style={profileStyle.dashboard}>
              <TouchableOpacity style={profileStyle.dashboardItem}
                onPress={() => this.props.navigation.push({
                  key: 'SessionListView@' + this.props.uID,
                  showHeader: false,
                  global: false,
                  passProps: {
                    uID: this.props.uID
                  }
                })
              }>
                <View>
                  {this._renderCenteredText(profile.sessionCount, profileStyle.dashboardTextColor)}
                  {this._renderCenteredText('SESSIONS', profileStyle.dashboardText)}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={profileStyle.dashboardItem}
                onPress={()=>this.props.navigation.push({
                  key: "UserListView",
                  showHeader: false,
                  global: true,
                  passProps:{
                    userType: 'Followers',
                    uID: this.props.uID,
                    dbRef: 'followers',
                    navigation: this.props.navigation,
                    FitlyFirebase: this.props.FitlyFirebase,
                  }
                })}>
                <View>
                  {this._renderCenteredText(profile.followerCount, profileStyle.dashboardTextColor)}
                  {this._renderCenteredText('FOLLOWERS', profileStyle.dashboardText)}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={profileStyle.dashboardItem}
                onPress={()=>this.props.navigation.push({
                  key: "UserListView",
                  showHeader: false,
                  global: true,
                  passProps:{
                    userType: 'Following',
                    uID: this.props.uID,
                    dbRef: 'followings',
                    navigation: this.props.navigation,
                    FitlyFirebase: this.props.FitlyFirebase,
                  }
                })}>
                <View>
                  {this._renderCenteredText(profile.followingCount, profileStyle.dashboardTextColor)}
                  {this._renderCenteredText('FOLLOWING', profileStyle.dashboardText)}
                </View>
              </TouchableOpacity>
            </View>
            <View style={profileStyle.container}>
              <FeedTabs
                feeds={this.state.feed}
                profile={true}/>
            </View>

            <View style={{height: 100}}></View>
          </ScrollView>
        </View>
        <View style={[profileStyle.container, {flex: 1, backgroundColor: '#fff', width: width}]}>
          <FeedTabs
            feeds={this.state.othersFeed}
            profile={false}/>
        </View>
      </ScrollView>
    </View>
    );
  };
};

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
    action: bindActionCreators({storeUserProfile}, dispatch),
    navigation: bindActionCreators({ push, pop }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
