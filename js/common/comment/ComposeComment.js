import React, { Component } from 'react';
import { composeStyle, headerStyle, postStyle } from '../../styles/styles.js';
import {
  Modal,
  View,
  TextInput,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import HeaderInView from '../../header/HeaderInView.js';
import TagInput from 'react-native-tag-input';
import Icon from 'react-native-vector-icons/Ionicons';
import { pop, push, resetTo } from '../../actions/navigation.js';
import { save, clear } from '../../actions/drafts.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  savePhotoToDB,
  saveUpdateToDB
} from '../../library/firebaseHelpers.js';
import { selectPictureCropper } from '../../library/pictureHelper.js';
import Firebase from 'firebase';
import ParentView from './ParentView.js';
import CommentsView from './CommentsView.js';
import { NavigationActions } from 'react-navigation';
const isAndroid = Platform.OS === 'android';

//TODO: input validation??
const hashTagRegex = /^\w+$/g;
class ComposeComment extends Component {
  componentDidUpdate(event) {
    Keyboard.addListener(
      isAndroid ? 'keyboardDidShow' : 'keyboardWillShow',
      event => {
        this.originalOffset = this.currentOffset;
        if (this.scollView) {
          this.scollView.scrollTo({
            y: this.currentOffset + event.endCoordinates.height + 50,
            animated: true
          });
        }
      }
    );
    Keyboard.addListener(
      isAndroid ? 'keyboardDidHide' : 'keyboardWillHide',
      event => {
        if (this.scollView) {
          this.scollView.scrollTo({
            y: this.originalOffset,
            animated: true
          });
        }
      }
    );
  }
  constructor(props) {
    super(props);
    this.initialState = {
      loading: false,
      contentType: 'light-content',
      content: '',
      photo: null,
      tags: [],
      scrollTo: 0
    };
    this.state = { ...this.initialState };
    this.user = this.props.user;
    this.uID = this.props.uID;
    this.database = this.props.FitlyFirebase.database();
    this.isPrivateContent = this.props.isPrivateContent;
    this.msgRef = this.database.ref('/messages/');
    this.userMsgRef = this.database.ref('/userMessages/' + this.uID);
    this._setRefs(this.props);

    //we send a notification to the author if someone reply to his/her content, but we dont do that for event or groups content when there multiple organizers
    if (this.props.contentInfo.parentAuthor) {
      this.parentAuthor = this.props.contentInfo.parentAuthor;
      this.notificationRef = this.database.ref(
        '/otherNotifications/' + this.parentAuthor
      );
    }
  }

  _setRefs(props) {
    this.contentID = props.contentInfo.contentID;
    this.contentType = props.contentInfo.contentType;

    if (this.contentType === 'post') {
      this.contentLink = '/posts/' + this.contentID;
      this.parentRef = this.database.ref(this.contentLink);
      this.parentCommentRef = this.database.ref(
        '/postComments/' + this.contentID
      );
    } else if (this.contentType === 'event') {
      this.contentLink = '/events/' + this.contentID;
      this.parentRef = this.database.ref(this.contentLink);
      this.parentCommentRef = this.database.ref(
        '/eventComments/' + this.contentID
      );
    } else if (this.contentType === 'message') {
      this.contentLink = '/messages/' + this.contentID;
      this.parentRef = this.database.ref(this.contentLink);
      this.parentCommentRef = this.parentRef.child('replies');
    } else if (this.contentType === 'photo') {
      this.contentLink = '/photos/' + this.contentID;
      this.parentRef = this.database.ref(this.contentLink);
      this.parentCommentRef = this.parentRef.child('replies');
    }
  }

  componentWillReceiveProps(nextProps) {
    this._setRefs(nextProps);
  }

  _sendMsg() {
    //tables to update: posts, userPosts, userUpdatesMajor, userUpdatesAll
    (async () => {
      try {
        this.setState({ loading: true });
        let draftState = this.state;
        let msgKey = this.msgRef.push().key;
        let authorInfo = {
          author: this.uID,
          authorName:
            this.user.public.first_name + ' ' + this.user.public.last_name,
          authorPicture: this.user.public.picture
        };

        let msgObj = {
          ...authorInfo,
          contentlink: this.contentLink,
          content: draftState.content,
          replyCount: 0,
          likeCount: 0,
          shareCount: 0,
          saveCount: 0,
          createdAt: Firebase.database.ServerValue.TIMESTAMP
        };
        if (this.state.photo) {
          let photoRefs = await savePhotoToDB(
            [this.state.photo],
            authorInfo,
            '/messages/' + msgKey
          );
          msgObj.photo = photoRefs[0];
          msgObj.content = null;
        }
        this.msgRef.child(msgKey).set(msgObj);
        this.userMsgRef
          .child(msgKey)
          .set({ timestamp: Firebase.database.ServerValue.TIMESTAMP });
        this.parentCommentRef
          .child(msgKey)
          .set({ timestamp: Firebase.database.ServerValue.TIMESTAMP });
        this.parentRef.child('replyCount').transaction(count => count + 1);
        this.parentRef
          .child('lastRepliedAt')
          .set(Firebase.database.ServerValue.TIMESTAMP);
        this.parentRef.child('lastMsg').set(this.state.content);

        if (this.parentAuthor) {
          const updateObj = {
            type: 'reply',
            sourceType: this.contentType,
            sourceID: this.contentID,
            msgID: msgKey,
            ownerID: this.uID,
            ownerName: authorInfo.authorName,
            ownerPicture: authorInfo.authorPicture,
            message: draftState.content,
            timestamp: Firebase.database.ServerValue.TIMESTAMP,
            isPrivate: this.isPrivateContent
          };

          // only adds to parentAuthor notifications if they are not the comment author
          if (this.parentAuthor !== this.uID) {
            this.notificationRef.push(updateObj);
          }
        }
        this.setState({ ...this.initialState });
      } catch (error) {
        this.setState({ loading: false });
        console.log('create post error', error);
      }
    })();
  }

  _sendPhotoMsg() {
    selectPictureCropper()
      .then(photo => {
        this.setState({ photo: { path: photo.uri } }, () => this._sendMsg());
      })
      .catch(error => {
        console.log('error getting photo');
      });
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        title="Post View"
        _onPressLeft={() => {
          this.props.navigation.dispatch(
            NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: this.props.screenProps.tabNavigation.state.key
                })
              ]
            })
          );
        }}
      />
    );
  }
  currentOffset = 0;
  _renderInputBar() {
    return (
      <KeyboardAvoidingView behavior={'padding'} style={postStyle.inputBar}>
        <AutoExpandingTextInput
          clearButtonMode="always"
          onChangeText={text => this.setState({ content: text })}
          style={postStyle.replyInput}
          value={this.state.content}
          placeholderTextColor="grey"
          // autoFocus={true}
          returnKeyType="send"
          onSubmitEditing={() => this._sendMsg()}
        />
        {this.state.loading ? (
          <ActivityIndicator
            animating={this.state.loading}
            // style={{position:'absolute', top: 0, right: 0, height: 80}}
            size="small"
          />
        ) : (
          <TouchableOpacity
            style={postStyle.cameraBtn}
            onPress={() => this._sendPhotoMsg()}
          >
            <Icon name="ios-camera-outline" size={35} color="#888" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    );
  }
  scollView = null;
  render() {
    let draftState = this.state;
    return (
      <View style={{ flex: 1 }}>
        {this._renderHeader()}
        <ScrollView
          ref={ref => {
            this.scollView = ref;
          }}
          onScroll={event => {
            this.currentOffset = event.nativeEvent.contentOffset.y;
          }}
          keyboardDismissMode={isAndroid ? 'none' : 'on-drag'}
        >
          <KeyboardAvoidingView
            behavior={'padding'}
            style={postStyle.scrollContentContainer}
          >
            <View style={[postStyle.postContainer, { borderBottomWidth: 0 }]}>
              <ParentView
                screenProps={this.props.screenProps}
                navigation={this.props.navigation}
                route={this.props.contentInfo}
                isPrivateContent={this.isPrivateContent}
                pushRoute={this.props.pushRoute}
              />
              <CommentsView
                navigation={this.props.navigation}
                screenProps={this.props.screenProps}
                route={this.props.contentInfo}
                isPrivateContent={this.isPrivateContent}
                pushRoute={this.props.pushRoute}
              />
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
        {this._renderInputBar()}
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop, push, resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposeComment);
