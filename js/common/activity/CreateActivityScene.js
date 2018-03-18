import React, { Component } from 'react';
import {
  composeStyle,
  optionStyle,
  feedEntryStyle,
  container,
  FitlyBlueClear
} from '../../styles/styles.js';
import {
  findNodeHandle,
  Alert,
  Modal,
  View,
  TextInput,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SegmentedControlIOS,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform
} from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import FMPicker from 'react-native-fm-picker';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import TagInput from 'react-native-tag-input';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalPicker from 'react-native-modal-picker';
import { pop, push, resetTo } from '../../actions/navigation.js';
import { save, clear } from '../../actions/drafts.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  uploadPhoto,
  saveUpdateToDB,
  randomString,
  saveTags
} from '../../library/firebaseHelpers.js';
import {
  getImageFromCam,
  getImageFromLib,
  selectPictureCropper
} from '../../library/pictureHelper.js';
import Firebase from 'firebase';
import {
  getWeekdayMonthDay,
  getHrMinDuration,
  getDateStringByFormat,
  addOneHour
} from '../../library/convertTime.js';
import HeaderInView from '../../header/HeaderInView.js';
import Spinner from 'react-native-loading-spinner-overlay';
// import Communications from 'react-native-communications';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SPORTS from '../../constants/SPORTS.js';
import DatePicker from 'react-native-datepicker';
import SelectLocationScene from './SelectLocationSceneDrawer';
import Picker from 'react-native-picker';
import { newCats, getNewCategories } from '../../constants/categories';

import { NavigationActions } from 'react-navigation';
import DateTimePicker from '../DateTimePicker';
const isAndroid = Platform.OS === 'android';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// TODO: input validation??
const hashTagRegex = /^\w+$/g;

function createReferenceObj(array = []) {
  return array.reduce((obj, element) => {
    obj[element] = true;
    return obj;
  }, {});
}

const Entry = props => (
  <View style={{ marginLeft: 20 }}>
    <Text>{props.text}</Text>
  </View>
);

const deviceWidth = Dimensions.get('window').width;

class CreateActivityScene extends Component {
  constructor(props) {
    super(props);
    const { state: navState } = this.props.navigation.state;
    // this.props.groupID; if this is created as a group, you cannot select specific invites
    if (!navState) {
      this.draftRef = randomString();
      this.props.draftsAction.save(this.draftRef, {
        title: '',
        details: '',
        tags: [],
        mainPhoto: null,
        photos: [],
        startDate: null,
        endDate: null,
        otherOrganizers: [], // ['uid1', 'uid2']
        cost: 0,
        groupID: this.props.groupID || null,
        location: {
          coordinate: null,
          address: null,
          placeName: null
        },
        photoRefs: null,
        category: '',
        isPublic: true,
        backgroundImage: null,
        invites: {
          allFollowers: false,
          allFollowings: false,
          allPrevConnected: false,
          facebookFriend: false,
          users: {},
          contacts: {}
        }
      });
    } else {
      this.draftRef = this.props.navigation.state.params.draftRef;
    }
    const draft = Object.assign({}, this.props.drafts[this.draftRef]);
    this.state = {
      editCost: false,
      editName: false,
      editDetails: false,
      startTime: draft.startDate,
      endTime: draft.endDate,
      loading: false,
      modalVisible: false,
      contentType: 'light-content',
      otherOrganizersDetails: [], // {uid, name, picture}
      error: null,
      locationPicker: false,
      fadeAnim: new Animated.Value(0),
      heightAnim: new Animated.Value(-500)
    };

    this.draftsAction = this.props.draftsAction;
    this.setDraftState = this.props.draftsAction.save.bind(this, this.draftRef);
    this.clearState = this.props.draftsAction.clear.bind(this, this.draftRef);
    this.user = this.props.user;
    this.uID = this.props.uID;
    this.database = this.props.FitlyFirebase.database();
    this._setCost = this._setCost.bind(this);
    this._updateBackgroundImage = this._updateBackgroundImage.bind(this);

    this.newCategories = getNewCategories();
  }

  componentWillReceiveProps(nextProps) {}

  _createPicker(category) {
    const selectedValue = category || ['Fitness', 'Aerial'];
    Picker.init({
      pickerData: newCats,
      pickerCancelBtnColor: [100, 100, 100, 1],
      pickerToolBarBg: [255, 255, 255, 1],
      pickerBg: [255, 255, 255, 1],
      selectedValue,
      pickerTitleText: 'Categories',
      onPickerConfirm: category => {
        this.setDraftState({ category });
      }
    });
    Picker.show();
  }

  _checkIncomplete(draftState) {
    let error;
    if (!draftState.title.length) {
      error = 'missing title';
    } else if (!draftState.startDate.date) {
      error = 'missing startDate';
    } else if (!draftState.endDate.date) {
      error = 'missing endDate';
    } else if (!draftState.location.address) {
      error = 'missing address';
    } else {
      return true;
    }
    Alert.alert('information missing', error);
    return false;
  }

  _saveActivityToDB() {
    // events, userEvents, groupEvents,
    // invites, send notifications?:
    // user click to see the event on feed
    const draftState = this.props.drafts[this.draftRef];
    if (this._checkIncomplete(draftState) === false) {
      return;
    }

    (async () => {
      try {
        this.setState({ loading: true });
        const { invites } = draftState;
        const eventKey = this.database.ref('events').push().key;
        const authorInfo = {
          author: this.uID,
          authorName: `${this.user.public.first_name} ${
            this.user.public.last_name
          }`,
          authorPicture: this.user.public.picture
        };

        const backgroundImageLink = draftState.backgroundImage
          ? await uploadPhoto(
              `events/${eventKey}/backgroundImage/`,
              draftState.backgroundImage
            )
          : null;
        const tagObj = createReferenceObj(draftState.tags);
        if (draftState.tags.length)
          saveTags(draftState.tags, eventKey, 'event');
        const organizerObj = createReferenceObj(
          [this.uID].concat(draftState.otherOrganizers)
        );
        const organizerFeedObj = createReferenceObj(draftState.otherOrganizers);
        const shareCount = draftState.isPublic ? 0 : null;
        const eventObj = {
          status: 'normal',
          location: draftState.location,
          cost: draftState.cost,
          createdAt: Firebase.database.ServerValue.TIMESTAMP,
          details: draftState.details,
          isPublic: draftState.isPublic,
          likeCount: 0,
          memberCount: draftState.otherOrganizers.length + 1,
          organizers: organizerObj,
          saveCount: 0,
          shareCount,
          title: draftState.title,
          updatedAt: Firebase.database.ServerValue.TIMESTAMP,
          groupID: draftState.groupID,
          startDate: draftState.startDate.date.getTime(),
          endDate: draftState.endDate.date.getTime(),
          tags: tagObj,
          backgroundImage: backgroundImageLink,
          category: !draftState.category ? 'none' : draftState.category
        };

        // if group push to group event
        // push to subscriber feeds, handle in server or in client
        // for each organizers
        const event = await this.database
          .ref(`/events/${eventKey}`)
          .set(eventObj);
        this.setState({ loading: false });

        if (this.props.groupID) {
          this.database
            .ref(`/groupEvents/${this.props.groupID}/${eventKey}`)
            .set({ timestamp: Firebase.database.ServerValue.TIMESTAMP });
          const updateKey = this.database.ref().push().key;
          const updateObj = {
            type: 'groupEvent',
            contentID: eventKey,
            contentlink: `/events/${eventKey}`,
            groupID: this.props.groupID,
            organizers: organizerObj,
            groupName: `${this.user.public.first_name} ${
              this.user.public.last_name
            }`,
            groupPicture: this.user.public.picture,
            contentTitle: draftState.title,
            contentSnipet: draftState.details.slice(0, 200),
            timestamp: Firebase.database.ServerValue.TIMESTAMP,
            location: draftState.location,
            startDate: draftState.startDate.date.getTime(),
            endDate: draftState.endDate.date.getTime(),
            tags: tagObj,
            isPublic: draftState.isPublic,
            category: draftState.category === '' ? 'none' : draftState.category
          };

          const groupMembers = await this.FitlyFirebase.database()
            .ref(`/groupMembers/${this.props.groupID}`)
            .once('value');
          const updateFanOut = {};
          for (const member in groupMembers) {
            updateFanOut[`/feeds/${member}/${updateKey}`] = updateObj;
          }
          this.database.ref().update(updateFanOut);
        } else {
          [this.uID].concat(draftState.otherOrganizers).forEach(uid => {
            this.database
              .ref(`/userEvents/${uid}/${eventKey}`)
              .set({ timestamp: Firebase.database.ServerValue.TIMESTAMP });
          });
          const updateKey = this.database
            .ref(`userUpdatesMajor/${this.uID}`)
            .push().key;
          const updateObj = {
            type: 'event',
            contentID: eventKey,
            contentlink: `/events/${eventKey}`,
            ownerID: this.uID,
            organizers: organizerObj,
            ownerName: `${this.user.public.first_name} ${
              this.user.public.last_name
            }`,
            ownerPicture: this.user.public.picture,
            contentTitle: draftState.title,
            contentSnipet: draftState.details.slice(0, 200),
            timestamp: Firebase.database.ServerValue.TIMESTAMP,
            location: draftState.location,
            startDate: draftState.startDate.date.getTime(),
            endDate: draftState.endDate.date.getTime(),
            tags: tagObj,
            isPublic: draftState.isPublic,
            notifImage: backgroundImageLink,
            category: draftState.category === '' ? 'none' : draftState.category
          };

          let followers = {};
          let followings = {};
          let prevConnectedUsers = {};
          if (invites.allFollowers) {
            followers = (await this.database
              .ref(`/followers/${this.props.uID}`)
              .once('value')).val();
          }

          if (invites.allFollowings) {
            followings = (await this.database
              .ref(`/followings/${this.props.uID}`)
              .once('value')).val();
          }

          if (invites.allPrevConnected) {
            prevConnectedUsers = (await this.database
              .ref(`/userWorkOutPartners/${this.props.uID}`)
              .once('value')).val();
          }

          if (invites.facebookFriend) {
            // need to handle facebook friends
            console.log('facebookFriend');
          }

          if (Object.keys(invites.contacts).length) {
            console.log('contacts');
          }

          const updateFanOut = {};
          const receivers = Object.assign(
            {},
            followers,
            followings,
            prevConnectedUsers,
            invites.users,
            organizerFeedObj
          );
          for (const receiver in receivers) {
            updateFanOut[`/feeds/${receiver}/${updateKey}`] = updateObj;
          }
          this.database.ref().update(updateFanOut);

          if (draftState.isPublic) {
            if (invites.allFollowers) {
              // dont send a major update otherwise a duplicate will send to followers' feeds
              saveUpdateToDB(updateObj, this.uID, { minor: true });
            } else {
              saveUpdateToDB(updateObj, this.uID);
            }
          }
        }

        this.props.draftsAction.clear(this.draftRef);

        const navigateToEvent = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'TabNavigator' }),
            NavigationActions.navigate({
              routeName: 'EventScene',
              params: { eventID: eventKey, isAdmin: true }
            })
          ]
        });

        this.props.navigation.dispatch(navigateToEvent);

        // this.props.navigation.dispatch(navigateToEvent);
      } catch (error) {
        this.setState({ loading: false });
        console.log('create post error', error);
      }
    })();
  }

  _updateBackgroundImage() {
    selectPictureCropper()
      .then(picture => {
        this.setDraftState({ backgroundImage: picture.uri });
      })
      .catch(error => console.log('update profile pic', error));
  }

  _setCost() {
    const { cost } = this.props.drafts[this.draftRef];
    const numericCost = parseFloat(cost).toFixed(2);
    if (numericCost < 0.01 || isNaN(numericCost)) {
      this.setDraftState({ cost: 0 });
    } else {
      this.setDraftState({ cost: numericCost });
    }
    this.setState({ editCost: false });
  }

  _renderBackgroundImage(draftState) {
    const { backgroundImage } = draftState;
    const { width } = Dimensions.get('window');
    let style = {
      borderRadius: 40,
      width: 80,
      height: 80,
      borderColor: '#aaa',
      borderWidth: 1,
      marginBottom: 30,
      justifyContent: 'center',
      backgroundColor: '#fff'
    };
    if (backgroundImage) {
      style = { height: 150, width, justifyContent: 'flex-end' };
    }
    return (
      <TouchableOpacity
        style={[
          optionStyle.entry,
          {
            justifyContent: 'center',
            height: 150,
            width,
            backgroundColor: '#eee',
            flexDirection: 'row',
            alignItems: 'center'
          }
        ]}
        onPress={this._updateBackgroundImage}
      >
        <Image
          style={style}
          resizeMode="cover"
          source={backgroundImage && { uri: backgroundImage, isStatic: true }}
          defaultSource={require('../../../img/default-photo-image.png')}
        >
          {!backgroundImage && (
            <Text
              style={{
                textAlign: 'center',
                paddingTop: 5,
                alignSelf: 'center'
              }}
            >
              <Icon name="md-cloud-upload" size={40} color="#aaa" />
            </Text>
          )}
        </Image>

        {!backgroundImage && (
          <View
            style={{
              position: 'absolute',
              bottom: 15,
              left: 0,
              right: 0,
              paddingVertical: 10,
              alignItems: 'center'
            }}
          >
            <Icon name="md-cloud-upload" size={80} color="#333" />
            <Text style={{ fontSize: 20, color: '#333' }}>
              {' '}
              Upload an image{' '}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  _renderTitle(draftState) {
    return (
      <View style={{ width: deviceWidth }}>
        <TouchableOpacity
          style={optionStyle.eventEntryContainer}
          onPress={() => this.setState({ editName: true })}
        >
          {this.state.editName ? (
            <TextInput
              underlineColorAndroid={'transparent'}
              returnKeyType="done"
              maxLength={30}
              autoFocus
              clearButtonMode="always"
              onChangeText={text => this.setDraftState({ title: text })}
              style={{ marginLeft: 20, width: 200 }}
              onSubmitEditing={() => this.setState({ editName: false })}
              onEndEditing={() => this.setState({ editName: false })}
              value={draftState.title}
              placeholder="Event Title"
              placeholderTextColor="grey"
              autoCapitalize="sentences"
            />
          ) : (
            <Text style={optionStyle.label}>
              Event Title: {draftState.title ? draftState.title : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  _renderOrganizers(draftState) {
    const { public: userProfile } = this.props.user;
    return (
      <TouchableOpacity
        style={optionStyle.entry}
        onPress={() => {
          this.props.navigation.navigate('SelectAdminsScene', {
            draftRef: this.draftRef,
            renderHeader: this._renderHeader.bind(this)
          });
        }}
      >
        <View style={{ marginTop: 15, marginBottom: 15, marginLeft: 20 }}>
          <Text style={{ marginBottom: 10 }}>Organizer:</Text>
          <ScrollView
            contentContainerStyle={{
              flexDirection: 'row',
              justifyContent: 'center'
            }}
            horizontal
          >
            <View style={{ alignItems: 'center', margin: 5 }}>
              <Image
                source={
                  userProfile.picture
                    ? { uri: userProfile.picture }
                    : require('../../../img/default-user-image.png')
                }
                style={feedEntryStyle[`${userProfile.account}Img`]}
                defaultSource={require('../../../img/default-user-image.png')}
              />
              <Text>
                {`${userProfile.first_name} ${userProfile.last_name}`}
              </Text>
            </View>
            {draftState.adminDetails &&
              Object.keys(draftState.adminDetails).map((name, i) => {
                const organizer = draftState.adminDetails[name];
                return (
                  <View
                    key={i + name}
                    style={{ alignItems: 'center', margin: 5 }}
                  >
                    <Image
                      source={
                        organizer.userPic
                          ? { uri: organizer.userPic }
                          : require('../../../img/default-user-image.png')
                      }
                      defaultSource={require('../../../img/default-user-image.png')}
                      style={feedEntryStyle[`${organizer.account}Img`]}
                    />
                    <Text>{name}</Text>
                  </View>
                );
              })}
          </ScrollView>
        </View>
        <View style={[optionStyle.icon, { right: 22, top: 40 }]}>
          <Icon name="ios-add-outline" size={40} color="#bbb" />
        </View>
      </TouchableOpacity>
    );
  }

  _renderInvites(draftState) {
    const { public: userProfile } = this.props.user;
    const { invites } = draftState;
    const contactsCount = Object.keys(invites.contacts).length;
    return (
      <TouchableOpacity
        style={optionStyle.entry}
        onPress={() => {
          this.props.navigation.navigate('SelectInvitesScene', {
            draftRef: this.draftRef,
            renderHeader: this._renderHeader.bind(this)
          });
        }}
      >
        <View style={{ marginTop: 15, marginBottom: 15 }}>
          <Text style={{ marginLeft: 20, marginBottom: 10 }}>
            Select Invites:
          </Text>
          {invites.allFollowings ? <Entry text="all followings" /> : null}
          {invites.allFollowers ? <Entry text="all followers" /> : null}
          {invites.allPrevConnected ? (
            <Entry text="all previously connected users" />
          ) : null}
          {invites.facebookFriend ? (
            <Entry text="all facebook friends" />
          ) : null}
          {contactsCount ? (
            <Entry text={`contacts: ${contactsCount} added`} />
          ) : null}
          {invites.names
            ? Array.from(Object.keys(invites.names)).map((name, i) => (
                <Entry key={i + name} text={name} />
              ))
            : null}
        </View>
        <View style={[optionStyle.icon, { right: 22 }]}>
          <Icon name="ios-add-outline" size={40} color="#bbb" />
        </View>
      </TouchableOpacity>
    );
  }

  _renderPublicOrPrivate(draftState) {
    return (
      <View
        style={[
          optionStyle.entry,
          { flexDirection: 'column', alignItems: 'flex-start' }
        ]}
      >
        <Text style={{ marginTop: 15, marginLeft: 20 }}>
          Only users invited can join private events {'\n'}
        </Text>
        <View
          style={{
            marginBottom: 15,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'stretch'
          }}
        >
          <SegmentedControlTab
            tabsContainerStyle={{
              alignSelf: 'stretch',
              marginLeft: 20,
              marginRight: 20
            }}
            values={['Public', 'Private']}
            selectedIndex={draftState.isPublic ? 0 : 1}
            onTabPress={index =>
              index
                ? this.setDraftState({ isPublic: false })
                : this.setDraftState({ isPublic: true })
            }
          />
        </View>
      </View>
    );
  }

  _renderSchedule(draftState) {
    const { startDate, endDate } = draftState;
    let displayDay;
    if (startDate && endDate) {
      displayDay = getWeekdayMonthDay(startDate.date);
      if (displayDay !== getWeekdayMonthDay(endDate.date)) {
        displayDay = `${displayDay} - ${getWeekdayMonthDay(endDate.date)}`;
      }
    }
    return (
      <TouchableOpacity
        style={[optionStyle.entry, { width: deviceWidth }]}
        onPress={() =>
          this.props.navigation.navigate('SelectDateScene', {
            draftRef: this.draftRef
          })
        }
      >
        {startDate && endDate ? (
          <View style={{ marginLeft: 20 }}>
            <Text>{displayDay}</Text>
            <Text>{getHrMinDuration(startDate.date, endDate.date)}</Text>
          </View>
        ) : (
          <Text style={{ marginLeft: 20 }}>Select a Date</Text>
        )}
      </TouchableOpacity>
    );
  }

  _toggleLocationPicker() {
    this.setState({ locationPicker: !this.state.locationPicker });
    // let opacity = this.state.fadeAnim._value == 0 ? 1 : 0;
    // let height = this.state.heightAnim._value == -500 ? 0 : -500;
    //
    // Animated.timing(
    //   this.state.fadeAnim, {toValue: opacity}
    // ).start();
    //
    // Animated.timing(
    //   this.state.heightAnim, {toValue: height}
    // ).start();
    // });
  }

  _modifyAdress(address) {
    const copy = address.slice(0).split(', ');
    const street = copy[0];
    const cityStateZip = `${copy[1]}, ${copy[2]}`;
    return [street, cityStateZip].join('\n');
  }

  _modifyAdressName(name) {
    return name.length > 30 ? `${name.slice(0, 27)}...` : name;
  }

  _renderLocation(draftState) {
    const { location } = draftState;

    return (
      <TouchableOpacity
        style={optionStyle.eventEntryContainer}
        onPress={() => {
          this.props.navigation.navigate('SelectLocationScene', {
            draftRef: this.draftRef
          });
        }}
      >
        <View style={optionStyle.eventEntryLeft}>
          <View style={{ width: 22.5, alignItems: 'flex-start' }}>
            <Icon name="ios-pin-outline" size={30} color="#aaa" />
          </View>
          <Text style={optionStyle.label}>Location: </Text>
        </View>
        <View style={optionStyle.eventEntryRight}>
          {location.address ? (
            <View
              style={{
                flexDirection: 'column',
                flexWrap: 'wrap',
                flex: 1,
                alignItems: 'flex-end'
              }}
            >
              {location.placeName !== 'unamed' && (
                <Text style={{ textAlign: 'right', flexWrap: 'wrap' }}>
                  {this._modifyAdressName(location.placeName)}
                </Text>
              )}
              <Text style={{ textAlign: 'right' }}>
                {this._modifyAdress(location.address)}
              </Text>
            </View>
          ) : (
            <Icon name="ios-arrow-down-outline" size={30} color="#aaa" />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  _renderCategories(draftState) {
    const { category } = draftState;
    const { width } = Dimensions.get('window');
    return (
      <ModalPicker
        data={this.newCategories}
        onChange={option => this.setDraftState({ category: option.label })}
      >
        {/* <TouchableOpacity */}
        <View
          style={optionStyle.eventEntryContainer}
          //onPress={() => this._createPicker(category)}
        >
          <View style={optionStyle.eventEntryLeft}>
            <Icon name="ios-browsers-outline" size={30} color="#aaa" />
            <Text style={optionStyle.label}>Category: </Text>
          </View>
          <View style={optionStyle.eventEntryRight}>
            <Text style={{ textAlign: 'right' }}>
              {/*(category && category.join(',\n')) || (*/
              // (category && category[1]) || (
              category || (
                <Icon name="ios-arrow-down-outline" size={30} color="#aaa" />
              )}
            </Text>
          </View>
          {
            // <FMPicker ref={'categoryPicker'}
            //   options={SPORTS}
            //   labels={SPORTS}
            //   onSubmit={(category) => this.setDraftState({category})}
            //   />
          }
          {/* </TouchableOpacity> */}
        </View>
      </ModalPicker>
    );
  }

  _renderOccurrence = draftState => {
    const { category } = draftState;
    const { width } = Dimensions.get('window');
    return (
      <TouchableOpacity
        style={optionStyle.eventEntryContainer}
        onPress={() => console.log('hello')}
      >
        <View style={optionStyle.eventEntryLeft}>
          <View style={{ width: 22.5, alignItems: 'flex-start' }}>
            <Icon name="ios-refresh-outline" size={35} color="#aaa" />
          </View>
          <Text style={optionStyle.label}>Repeat: </Text>
        </View>
        <View style={optionStyle.eventEntryRight}>
          <Text>
            {category || (
              <Icon name="ios-arrow-down-outline" size={30} color="#aaa" />
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  _renderCost(draftState) {
    const { editCost } = this.state;
    const { cost } = draftState;
    return (
      <TouchableOpacity
        style={optionStyle.eventEntryContainer}
        onPress={() => this.setState({ editCost: true })}
      >
        <View style={optionStyle.eventEntryLeft}>
          <View style={{ width: 22.5, alignItems: 'flex-start' }}>
            <Icon name="ios-pricetags-outline" size={25} color="#aaa" />
          </View>
          <Text style={optionStyle.label}>Cost: </Text>
        </View>
        <View style={optionStyle.eventEntryRight}>
          {editCost ? (
            <TextInput
              underlineColorAndroid={'transparent'}
              ref="cost"
              returnKeyType="done"
              maxLength={30}
              autoFocus
              keyboardType="numeric"
              clearButtonMode="always"
              onChangeText={text => this.setDraftState({ cost: text })}
              onSubmitEditing={this._setCost}
              onEndEditing={this._setCost}
              value={cost.toString()}
              style={{ width: 100, textAlign: 'right' }}
              placeholder="amount"
              placeholderTextColor="grey"
              onFocus={(event: Event) => {
                this._scrollToInput(findNodeHandle(event.target));
              }}
            />
          ) : (
            <Text>{cost ? `$ ${cost}` : 'free'}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  _renderDetails(draftState) {
    return (
      <TouchableOpacity
        style={[optionStyle.entry, { paddingTop: 15, paddingBottom: 15 }]}
        onPress={() => this.setState({ editDetails: true })}
      >
        {this.state.editDetails ? (
          <AutoExpandingTextInput
            clearButtonMode="always"
            autoFocus
            onChangeText={text => this.setDraftState({ details: text })}
            style={{ marginLeft: 20, width: 300, fontSize: 16 }}
            multiline
            onSubmitEditing={() => this.setState({ editDetails: false })}
            onEndEditing={() => this.setState({ editDetails: false })}
            value={draftState.details}
            placeholder="Activity Details"
            placeholderTextColor="grey"
            onFocus={(event: Event) => {
              this._scrollToInput(findNodeHandle(event.target));
            }}
          />
        ) : (
          <View>
            <Text style={[optionStyle.label, { marginLeft: 20 }]}>
              Activity Details: {'\n'}
            </Text>
            <Text style={{ marginLeft: 20, width: 300 }}>
              {draftState.details ? draftState.details : 'no details'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  _renderHashTags(draftState) {
    return (
      <View style={composeStyle.hashTagInput}>
        <Text style={composeStyle.hashTag}>#</Text>
        <TagInput
          value={draftState.tags}
          onChange={tags => this.setDraftState({ tags })}
          regex={hashTagRegex}
        />
      </View>
    );
  }

  _renderHeader(text, rightTxt, pressRight) {
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        rightElement={{ text: rightTxt }}
        title={text}
        _onPressRight={() => pressRight()}
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  _scrollToInput(reactNode) {
    this.refs.createActivityScroll.scrollToFocusedInput(reactNode);
  }

  _renderStartDate() {
    let startDate, endDate;
    if (this.draftRef) {
      startDate = this.props.drafts[this.draftRef].startDate;
      endDate = this.props.drafts[this.draftRef].endDate;
    } else {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
    }
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const c = new Date(year + 1, month, day);

    return (
      <TouchableOpacity
        style={optionStyle.eventEntryContainer}
        onPress={() => this.refs.startDate.onPressDate()}
      >
        <View style={optionStyle.eventEntryLeft}>
          <Icon name="ios-calendar-outline" size={30} color="#aaa" />
          <Text style={optionStyle.label}>Start Date: </Text>
        </View>
        <View style={{ width: 0 }}>
          <DateTimePicker
            ref={'startDate'}
            minDate={new Date()}
            maxDate={(endDate && endDate.date) || c}
            onDateChange={(dateString, date) => {
              //this.setDraftState({ startDate: { dateString, date } });
              //this.setState({ startTime: true });
              const endDate = addOneHour(dateString);
              this.setDraftState({
                startDate: { dateString, date },
                endDate: { dateString: endDate.dateString, date: endDate.date }
              });
              this.setState({ startTime: true, endTime: true });
            }}
          />
          {/*
          <DatePicker
            ref={'startDate'}
            style={optionStyle.datePicker}
            mode="datetime"
            format={'ddd, MMM Do, h:mm A'}
            placeholder="Date"
            minDate={new Date()}
            maxDate={(endDate && endDate.date) || c}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            onDateChange={(dateString, date) => {
              this.setDraftState({ startDate: { dateString, date } });
              this.setState({ startTime: true });
            }}
            customStyles={datepickerStyle}
            showIcon={false}
          />
          */}
        </View>
        <View style={optionStyle.eventEntryRight}>
          <Text>
            {(startDate && startDate.dateString) || (
              <Icon name="ios-arrow-down-outline" size={30} color="#aaa" />
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  _renderEndDate() {
    let startDate, endDate;
    if (this.draftRef) {
      startDate = this.props.drafts[this.draftRef].startDate;
      endDate = this.props.drafts[this.draftRef].endDate;
    } else {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
    }

    return (
      <TouchableOpacity
        style={optionStyle.eventEntryContainer}
        onPress={() => this.refs.endDate.onPressDate()}
      >
        <View style={optionStyle.eventEntryLeft}>
          <Icon name="ios-calendar-outline" size={30} color="#aaa" />
          <Text style={optionStyle.label}>End Date: </Text>
        </View>
        <View style={{ width: 0 }}>
          <DateTimePicker
            ref={'endDate'}
            minDate={(startDate && startDate.date) || new Date()}
            onDateChange={(dateString, date) => {
              this.setDraftState({ endDate: { dateString, date } });
              this.setState({ endTime: true });
            }}
          />
          {/*
          <DatePicker
            ref={'endDate'}
            style={optionStyle.datePicker}
            mode="datetime"
            format={'ddd, MMM Do, h:mm A'}
            placeholder="Date"
            minDate={(startDate && startDate.date) || new Date()}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            onDateChange={(dateString, date) => {
              this.setDraftState({ endDate: { dateString, date } });
              this.setState({ endTime: true });
            }}
            customStyles={datepickerStyle}
            showIcon={false}
          />
          */}
        </View>
        <View style={optionStyle.eventEntryRight}>
          <Text>
            {(endDate && endDate.dateString) || (
              <Icon name="ios-arrow-down-outline" size={30} color="#aaa" />
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const viewStyle = {
      flex: 0.5,
      height: SCREEN_HEIGHT * 2 / 3,
      width: SCREEN_WIDTH
    };
    const draftState = this.props.drafts[this.draftRef];
    if (draftState) {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar barStyle={this.state.contentType} />
          <Spinner
            visible={this.state.loading}
            textContent={'creating activity...'}
            textStyle={{ color: '#FFF' }}
          />
          {this._renderHeader(
            'Create Event',
            'Submit',
            this._saveActivityToDB.bind(this)
          )}
          <KeyboardAwareScrollView
            extraScrollHeight={0}
            enableResetScrollToCoords
            contentContainerStyle={composeStyle.scrollContentContainer}
            ref="createActivityScroll"
            showsVerticalScrollIndicator={false}
          >
            <View>
              {this._renderBackgroundImage(draftState)}
              {this._renderTitle(draftState)}
              {this._renderCategories(draftState)}
              {this._renderLocation(draftState)}
              {this._renderStartDate()}
              {this._renderEndDate()}
              {
                // TODO: Setup some kind of repeating event
                // this._renderOccurrence(draftState)
              }
              {this._renderCost(draftState)}
              {this._renderDetails(draftState)}
              {this._renderPublicOrPrivate(draftState)}
              {
                // {this._renderHashTags(draftState)}
                // {this._renderSchedule(draftState)}
                // {this._renderOrganizers(draftState)}
                // {this._renderInvites(draftState)}
              }
            </View>

            <Modal
              animationType={'slide'}
              transparent
              visible={false}
              onRequestClose={() => {}}
            >
              <KeyboardAwareScrollView
                extraScrollHeight={100}
                enableResetScrollToCoords
                contentContainerStyle={composeStyle.scrollContentContainer}
              >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <TouchableWithoutFeedback
                    onPress={this._toggleLocationPicker.bind(this)}
                  >
                    <View style={[viewStyle, { height: SCREEN_HEIGHT / 2 }]} />
                  </TouchableWithoutFeedback>
                  <View style={viewStyle}>
                    <SelectLocationScene
                      draftRef={this.draftRef}
                      header={false}
                      onPress={this._toggleLocationPicker.bind(this)}
                    />
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </Modal>
          </KeyboardAwareScrollView>
        </View>
      );
    }
    return <ActivityIndicator animating style={{ height: 80 }} size="large" />;
  }
}

const holder = () => {
  const viewStyle = { flex: 0 };
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,.5)',
        opacity: this.state.fadeAnim
      }}
      onPress={() => this._toggleLocationPicker()}
    >
      <View style={{ width: 300, height: 300, backgroundColor: 'red' }} />
      <Animated.View style={viewStyle}>
        <SelectLocationScene draftRef={this.draftRef} header={false} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const datepickerStyle = {
  dateIcon: {
    left: 0,
    marginLeft: 15
  },
  dateInput: {
    borderWidth: 0
  },
  dateText: {
    color: 'black',
    // width: 200,
    // textAlign: 'right',
    // marginRight: 100,
    alignSelf: 'flex-end'
  },
  btnCancel: {},
  placeholderText: {
    color: 'white',
    alignSelf: 'flex-end'
  },
  btnTextConfirm: {
    color: '#007AFF'
  }
};

const styles = StyleSheet.create({
  basicContainer: {
    justifyContent: 'flex-end'
  },
  modalContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: '#F5FCFF'
  },
  buttonView: {
    width: SCREEN_WIDTH,
    padding: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'lightgrey',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  bottomPicker: {
    width: SCREEN_WIDTH
  },
  mainBox: {}
});

const mapStateToProps = function(state) {
  return {
    drafts: state.drafts.drafts,
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop, push, resetTo }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  CreateActivityScene
);
