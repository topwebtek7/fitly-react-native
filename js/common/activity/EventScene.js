import React, {Component} from 'react';
import { eventStyle, postStyle, feedEntryStyle } from '../../styles/styles.js';
import { View, TextInput, Text, StatusBar, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, TouchableHighlight, InteractionManager } from 'react-native';
// import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { push, pop, resetTo } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {convertFBObjToArray, createContentListener, turnOffContentListner} from '../../library/firebaseHelpers.js'
import TimeAgo from 'react-native-timeago';
import Firebase from 'firebase';
import CommentsModal from '../comment/CommentsModal.js';
import SocialBtns from '../SocialBtns.js';
import Author from '../Author.js';
import {getWeekdayMonthDay, getHrMinDuration, getDateStringByFormat} from '../../library/convertTime.js';
import RenderUserBadges from '../RenderUserBadges.js'
import HeaderInView from '../../header/HeaderInView.js';
import Spinner from 'react-native-loading-spinner-overlay';

//TODO: below two function will be refactored out
//check if event is expired/canceled/happening/going to happen
class EventScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      commentLoading: true,
      modalVisible: false,
      members: [],
      menuOpen: false,
    };
    this.FitlyFirebase = this.props.FitlyFirebase;
    this.database = this.FitlyFirebase.database();
    this.uID = this.props.uID;
    this.isAdmin = this.props.navigation.state.params.isAdmin;
    this.user = this.props.user;
    this.eventRef = this.database.ref('events/' + this.props.navigation.state.params.eventID);
    this.eventMemberRef = this.database.ref('eventMembers/' + 'going/' + this.props.navigation.state.params.eventID);
    this.attendStatusRef = this.database.ref('eventMembers/' + 'main/' + this.props.navigation.state.params.eventID + '/' + this.uID);
    this.pushToRoute = this.props.navigation.navigate.bind(this);
  };

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      createContentListener(this.eventRef,
        (eventObj) => {
          this.setState({
            event: eventObj,
          });
        }
      )();

      if (!this.props.navigation.state.params.isAdmin) {
        const handleUpdates = (snap) => {
          let snapObj = snap.val();
          this.setState({attendStatus: snapObj || {}});
        };
        this.attendStatusRef.on('value', handleUpdates);
      }

      createContentListener(this.eventMemberRef, (membersObj) => {
        this.setState({members: Object.keys(membersObj)});
      })();
    });
  }

  componentWillUnmount() {
    turnOffContentListner(this.eventRef);
    turnOffContentListner(this.attendStatusRef);
  }

  // if admin: show edit btns, delete btn, invite btns, disable social btns
  // if not admin: no edit, delete btns, show going btns
    //if public: show all social btns
    //if private: like btn only
  _updateAttendStatus(status) {
    let mainPath = '/eventMembers/' + 'main/' + this.props.navigation.state.params.eventID + '/' + this.uID;
    let goingPath = '/eventMembers/' + 'going/' + this.props.navigation.state.params.eventID + '/' + this.uID;
    let notGoingPath = '/eventMembers/' + 'notGoing/' + this.props.navigation.state.params.eventID + '/' + this.uID;
    let maybePath = '/eventMembers/' + 'maybe/' + this.props.navigation.state.params.eventID + '/' + this.uID;
    let mainObj = {[mainPath]: {going: false, notGoing: false, maybe: false}};
    let goingObj = {[goingPath]: null};
    let notGoingObj = {[notGoingPath]: null};
    let maybeObj = {[maybePath]: null};

    if (status === 'going') {
      this.attendStatusRef.once('value')
      .then(snap => {
        const snapObj = snap.val();
        if (!snapObj || !snapObj.going) {
          this.eventRef.child('memberCount').transaction(memberCount => memberCount + 1);
        }
      })
      mainObj = {[mainPath]: {going: true, notGoing: false, maybe: false}}
      goingObj = {[goingPath]: true};
    } else if (status === 'notGoing') {
      this.attendStatusRef.once('value')
      .then(snap => {
        if (snap.val().going) {
          this.eventRef.child('memberCount').transaction(memberCount => memberCount - 1);
        }
      })
      mainObj = {[mainPath]: {going: false, notGoing: true, maybe: false}}
      notGoingObj = {[notGoingPath]: true};
    } else if (status === 'maybe') {
      this.attendStatusRef.once('value')
      .then(snap => {
        if (snap.val().going) {
          this.eventRef.child('memberCount').transaction(memberCount => memberCount - 1);
        }
      })
      mainObj = {[mainPath]: {going: false, notGoing: false, maybe: true}}
      maybeObj = {[maybePath]: true};
    }
    this.database.ref().update({...mainObj, ...goingObj, ...notGoingObj, ...maybeObj});
  }

  _renderAttendBtns(event) {
    const {attendStatus} = this.state;
    if (!attendStatus) {return null}
    const goingStyle = (attendStatus.going) ? eventStyle.btnTrue : eventStyle.btnFalse;
    const notGoingStyle = (attendStatus.notGoing) ? eventStyle.btnTrue : eventStyle.btnFalse;
    const maybeStyle = (attendStatus.maybe) ? eventStyle.btnTrue : eventStyle.btnFalse;

    return (
      <View>
      {this._renderCost(event.cost)}
      <View style={[eventStyle.attendStatusContainer, {borderBottomWidth: .5, borderColor: '#aaa', paddingBottom: 10, paddingTop: 10, marginTop: 10}]}>
        <TouchableOpacity style={goingStyle} onPress={() => this._updateAttendStatus('going')}>
          <Text style={eventStyle.goingBtnText}>Going</Text>
        </TouchableOpacity>
        <TouchableOpacity style={notGoingStyle} onPress={() => this._updateAttendStatus('notGoing')}>
          <Text style={eventStyle.goingBtnText}>Not Going</Text>
        </TouchableOpacity>
        <TouchableOpacity style={maybeStyle} onPress={() => this._updateAttendStatus('maybe')}>
          <Text style={eventStyle.goingBtnText}>Maybe</Text>
        </TouchableOpacity>
      </View>
      </View>
    )
  }

  _renderCost(event){
    return (
      <View>
        <Text style={
          [
            eventStyle.text,
            {
              textAlign: 'center',
              color: 'black',
              fontSize: 20,
              fontWeight: '200',
            },
          ]}
        >Cost: {(event.cost) ? event.cost : 'Free'}</Text>
      </View>)
  }

  _renderOrganizers() {
    return (
      <View style={[eventStyle.reverseEntryContainer, {alignItems: 'flex-start', justifyContent:'flex-start', borderBottomWidth: .5, borderColor: '#aaa'}]}>
        <Text style={
          [
            eventStyle.text,
            {
              color: 'black',
              fontSize: 20,
              fontWeight: '200',
            },
          ]}
        >Organizers:</Text>
        <RenderUserBadges
          userIDs={this.state.event.organizersArray}
          FitlyFirebase={this.FitlyFirebase}
          textStyle={{color: 'grey'}}
          pushToRoute={this.pushToRoute}
          uID={this.uID}
        />
      </View>
    )
  };

  _openMenu(){
    this.setState({menuOpen: !this.state.menuOpen})
  }

  _renderMenu(){
    return (
      <View style={{position: 'absolute', top: 10, right: 10, borderColor: '#aaa', borderWidth: 1, flex: 1, flexDirection: 'column', zIndex: 200, backgroundColor: '#fff', width: 100, padding: 10, shadowColor: "black", shadowOpacity: .6, elevation: 2, shadowOffset: {width: 0, height: 0}, shadowRadius: 2}}>
        <TouchableOpacity
          onPress={() => {
            this._openMenu();
            this.props.navigation.navigate("ReportScene", {type: 'event', details: this.state.event, contentID: this.props.navigation.state.params.eventID})
          }
        }>
          <Text>Report...</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderHeader() {
    return (this.props.navigation.state.params.isAdmin)
      ? <HeaderInView
          leftElement={{icon: "ios-arrow-round-back-outline"}}
          rightElement={{icon: "ios-options-outline"}}
          title='Event Details'
          _onPressRight={() => this.props.navigation.navigate("EventOptionsMenu", { uID: this.uID, navigateBack: this.props.navigation, FitlyFirebase: this.FitlyFirebase, eventID: this.props.navigation.state.params.eventID})}
          _onPressLeft={() => this.props.navigation.goBack()}
        />
     :  <HeaderInView
         leftElement={{icon: "ios-arrow-round-back-outline"}}
         rightElement={{icon: "ios-more"}}
         title='Event Details'
         _onPressLeft={() => this.props.navigation.goBack()}
         _onPressRight={this._openMenu.bind(this)}/>
  };

  _renderMembers() {
    return (
      <View style={[eventStyle.reverseEntryContainer, {alignItems: 'flex-start', justifyContent:'flex-start', borderBottomWidth: .5, borderColor: '#aaa', marginBottom: 10}]}>
        <Text style={
          [
            eventStyle.text,
            {
              color: 'black',
              fontSize: 20,
              fontWeight: '200',
            },
          ]}
        >Members:</Text>
        {(this.state.members.length)
          ? <RenderUserBadges
              userIDs={this.state.members}
              displayName={false}
              FitlyFirebase={this.FitlyFirebase}
              pushToRoute={this.pushToRoute}
              uID={this.uID}
            />
          : <Text style={postStyle.textContent}>no members yet</Text>
        }
      </View>
    )
  };


  _renderEventBody() {
    const {event} = this.state;
    const {width} = Dimensions.get('window');
    return (
      <View>
        <View>
          <Image
            style={{width: width, justifyContent: 'center', height: 250}}
            resizeMode='cover'
            source={(event.backgroundImage) ? {uri: event.backgroundImage, isStatic:true} : require('../../../img/default-photo-image.png')}
            defaultSource={require('../../../img/default-photo-image.png')}>

              {
                // <TimeAgo style={[feedEntryStyle.timestamp, {color: 'white'}]} time={event.createdAt} />
              }
            <View style={{width: width, height: 250, backgroundColor: 'rgba(0,0,0,.5)'}}>
              <View style={eventStyle.titleContainer}>
                <Text style={eventStyle.title}>{event.title}</Text>
                <Text
                  style={eventStyle.title}>
                  {/*Array.isArray(event.category) ? event.category.join(', ') : event.category}*/
                  Array.isArray(event.category) ? event.category[1] : event.category}
                </Text>
              </View>
              <View style={{position: 'absolute', bottom: 5, left: 0, right: 0}}>
              <Text style={{fontSize: 15, textAlign: 'center', color: 'white', paddingBottom: 10}}>{(event.isPublic) ? 'public event' : 'private event'} - <Text style={eventStyle.textContent}>{event.memberCount} going</Text> </Text></View>
            </View>
          </Image>
          <View>
            {(this.props.navigation.state.params.isAdmin) ? this._renderCost(event) : this._renderAttendBtns(event)}
          </View>

          {this._renderOrganizers()}

          <View style={{marginHorizontal: 15, paddingVertical: 5,  borderBottomWidth: .5, borderColor: '#aaa', alignItems: 'flex-start', flexDirection: 'column', justifyContent:'center'}}>
            <Text style={
              [
                eventStyle.text,
                {
                  color: 'black',
                  fontSize: 20,
                  fontWeight: '200',
                },
              ]}
            >Event Details:</Text>
            <Text style={postStyle.textContent}>{event.details || 'none'}</Text>
          </View>
          <View style={{marginHorizontal: 15, paddingVertical: 5,  borderBottomWidth: .5, borderColor: '#aaa', alignItems: 'flex-start', flexDirection: 'column', justifyContent:'center', alignSelf: 'stretch'}}>
            <Text style={
              [
                eventStyle.text,
                {
                  color: 'black',
                  fontSize: 20,
                  fontWeight: '200',
                },
              ]}
            >Time:</Text>
            <View style={{alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View>
                <Text style={[eventStyle.text, {color: 'black'}]}>{getWeekdayMonthDay(event.startDate)}</Text>
                <Text style={[eventStyle.text, {color: 'black'}]}>{getHrMinDuration(event.startDate, event.endDate)}</Text>
              </View>
              <View>
                <Icon
                  style={[eventStyle.icon, {paddingLeft: 10}]}
                  name="ios-calendar-outline" size={30} color="#bbb"/>
                {(this.props.navigation.state.params.isAdmin)
                  ? <Text style={{marginLeft: 10, color: 'black'}}
                    onPress={() => this.props.navigation.navigate("SelectDateScene", {
                      eventID: this.props.navigation.state.params.eventID,
                      startDate: event.startDate,
                      endDate: event.endDate,
                    })}>edit</Text>
                  : null}
                </View>
              </View>
            </View>
          </View>
          <View style={{marginHorizontal: 15, paddingVertical: 5,  borderBottomWidth: .5, borderColor: '#aaa', alignItems: 'flex-start', flexDirection: 'column', justifyContent:'center', alignSelf: 'stretch'}}>
            <Text style={
              [
                eventStyle.text,
                {
                  color: 'black',
                  fontSize: 20,
                  fontWeight: '200',
                },
              ]}
            >Location:</Text>
            <View style={{alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={{flex: .7}}>
                {event.location.placeName !== 'unamed' && <Text>{event.location.placeName}</Text>}
                <Text>{event.location.address}</Text>
              </View>
              <View style={{flex: .3, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-around'}}>
                <Icon style={eventStyle.icon} name="ios-map-outline" size={30} color="#bbb"/>
                {(this.props.navigation.state.params.isAdmin)
                  ? <TouchableHighlight
                      onPress={() => this.props.navigation.navigate("SelectLocationScene", {
                        eventID: this.props.navigation.state.params.eventID,
                        location: event.location,
                        header: true
                      })}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{color: 'black'}}>
                        edit
                      </Text>
                      </View>
                    </TouchableHighlight>
                : null}
              </View>
            </View>
        </View>
        {this._renderMembers()}
          {this._renderPhotos(event.photos)}
          {
            // this._renderTags(event.tags)
          }
        {this._renderSocialBtns()}
      </View>
    )
  };

  _renderEvent() {
    //implement reply notification for organizer only when there is one organizer
    const initialRoute = {
      contentID: this.props.navigation.state.params.eventID,
      contentType: 'event',
      parentAuthor: (this.state.event.organizers && this.state.event.organizers.length === 1) ? this.state.event.organizers[0] : null,
      isPrivateContent: !this.state.event.public
    };
    return <View>
      {this._renderEventBody()}
      <CommentsModal
        screenProps={this.props.screenProps}
        navigation={this.props.navigation}
        modalVisible={this.state.modalVisible}
        openModal={() => this.setState({modalVisible: true})}
        closeModal={() => this.setState({modalVisible: false})}
        initialRoute={initialRoute}
      />
    </View>
  };

  _renderSocialBtns() {
    //render social btn differently depending on whether the event is public
    const contentInfo = {
      contentID: this.props.navigation.state.params.eventID,
      contentType: 'event',
      parentAuthor: (this.state.event.organizersArray.length) ? this.state.event.organizersArray[0] : null,
      isPrivateContent: !this.state.event.isPublic
    };
    return (
      <SocialBtns
        contentInfo={contentInfo}
        content={this.state.event}
        buttons={{comment: true, like: true, share: true, save: true}}
        onComment={() => this.setState({modalVisible: true})}
      />
    )
  };

//TODO: below two functions will be refactored out
  _renderPhotos(photos) {
    if (!photos) {return null}
    return (
      <View style={postStyle.imgContainer}>
        {photos.map((photo, index) => {
          return (
            <TouchableOpacity style={postStyle.imagesTouchable}  key={'postPhotos' + index}
              onPress={() => this.props.navigation.navigate("EventImagesView", {
                photos
              })}>
              <Image style={postStyle.images} source={{uri: photo.link}} defaultSource={require('../../../img/default-photo-image.png')}/>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  _renderTags(tags) {
    if (!tags) {return null;}
    return <View style={postStyle.tagsRow}>
      {tags.map((tag, index) => {
        return (
          <Text style={postStyle.tags} key={'tag' + index}>#{tag}</Text>
        );
      })}
    </View>
  };


  render() {
    return <View style={{backgroundColor: 'white', flex: 1}}>
      {this._renderHeader()}
      <ScrollView
        contentContainerStyle={postStyle.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {this.state.menuOpen ? this._renderMenu() : null}
        {(this.state.event)
          ? this._renderEvent()
          : <Spinner visible={!this.state.event} textContent={""} textStyle={{color: '#FFF'}}/>

        }
        {/* <View style={{height: 100}}></View> */}
      </ScrollView>
    </View>
  };
}

const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    exnavigation: bindActionCreators({ push, pop, resetTo }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventScene);
