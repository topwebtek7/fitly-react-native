import React, {Component} from 'react';
import { postStyle, feedEntryStyle, headerStyle, profileStyle } from '../styles/styles.js';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {saveUpdateToDB} from '../library/firebaseHelpers.js'
import Firebase from 'firebase';
import NewCommentIcon from './NewCommentIcon'

class SocialBtns extends Component {
  constructor(props) {
    super(props);

    this.content = this.props.content;
    this.contentInfo = this.props.contentInfo;
    this.buttons = this.props.buttons;
    this.onComment = this.props.onComment;
    this.database = this.props.FitlyFirebase.database();
    this.user = this.props.user;
    this.uID = this.props.uID;
    const {contentType, contentID, parentAuthor, isPrivateContent} = this.contentInfo;
    this.state = {
      like: null,
      likeCount: this.content.likeCount,
      share: null,
      shareCount: this.content.shareCount,
      save: null,
      saveCount: this.content.saveCount,
      replyCount: this.content.replyCount,
      ownContent: parentAuthor === this.uID
    };
    this.userShareRef = this.database.ref('userShared/' + this.uID + '/' + contentID);
    this.userCollectionsRef = this.database.ref('userCollections/' + this.uID + '/' + contentID);
    this.userLikesRef = this.database.ref('userLikes/' + this.uID + '/' + contentID);
    this.userNotifRef = this.database.ref('otherNotifications/' + this.props.contentInfo.parentAuthor)

    this.contentRef = this.database.ref(contentType + 's').child(contentID);
    this.likeRef = this.database.ref(contentType + 'Likes').child(contentID);
    this.shareRef = this.database.ref(contentType + 'Shares').child(contentID);
    this.saveRef = this.database.ref(contentType + 'Saves').child(contentID);

    this.iconSize = 20;
    this.color = this.props.color || 'grey';
    this.hasLiked = false;
    this._toggleLike = this._toggleLike.bind(this);
    this._handleShare = this._handleShare.bind(this);
    this._handleSave = this._handleSave.bind(this);
    this.contentLink = this.props.content.contentlink || `/${this.props.contentInfo.contentType}/${this.props.contentInfo.contentID}`
  };

  componentDidMount() {
    this._getInitialStates();
    this.contentRef.child('replyCount').on('value', countSnap => this.setState({replyCount: countSnap.val()}));
  };

  componentWillUnmount() {
    this.contentRef.child('replyCount').off('value');
  };

  _getInitialStates() {
    const stateTypes = [
      {ref: this.likeRef, type: 'like'},
      {ref: this.shareRef, type: 'share'},
      {ref: this.saveRef, type: 'save'}
    ].map(state => {
      const {type} = state;
      state.ref.child(this.uID).once('value').then(snap => {
        let listObj =  snap.val();
        this.setState({
          [type]: !!(listObj),
        })
      }).catch(error => {
        console.log('social buttons get initialstate error', error);
      });
    })
  };

  _createUpdate(updateType) {
    const updateObj = {
      type: updateType,
      contentType: this.contentInfo.contentType,
      contentID: this.contentInfo.contentID,
      ownerID: this.uID,
      ownerName: this.user.public.first_name + ' ' + this.user.public.last_name,
      ownerPicture: this.user.public.picture,
      timestamp: Firebase.database.ServerValue.TIMESTAMP,
      contentlink: this.contentLink
    };

    if (this.contentInfo.contentType === 'post') {
      updateObj.postCategory = this.content.category;
      updateObj.contentTitle = this.content.title;
      updateObj.photos = this.content.photos;
    } else if (this.contentInfo.contentType === 'message') {
      if (this.content.photos) {
        updateObj.photos = [{
          [this.content.photo.key]: {
            link: this.content.photo.link
          }
        }];
      }
    } else if (this.contentInfo.contentType === 'photo') {
      updateObj.link = this.content.link;
    } else if (this.contentInfo.contentType === 'event') {
      updateObj.contentTitle = this.content.title;
      updateObj.contentSnipet = this.content.details;
      updateObj.location = this.content.location;
      updateObj.photos = this.content.photos || null;
      updateObj.organizers = this.content.organizers;
    }

    return updateObj;
  }

  _toggleLike() {
    (async () => {
      try {
        if (!this.state.like) {

          let likeNotif = this._createUpdate('like')
          this.userNotifRef.push(likeNotif);

          this.likeRef.child(this.uID).set(true);
          this.contentRef.child('likeCount').transaction(count => count + 1);
          if (!this.hasLiked && !this.contentInfo.isPrivateContent) {
            const updateObj = this._createUpdate('like');
            saveUpdateToDB(updateObj, this.uID, {minor: true});
            this.userLikesRef.set(updateObj);
            this.hasSentLike = true;
          }
          this.setState({
            like: true,
            likeCount: this.state.likeCount + 1
          });
          //tables to update: userLikes, postLikes, userUpdatesAll(only once)
        } else {
          this.likeRef.child(this.uID).set(null);
          this.userLikesRef.set(null);
          this.contentRef.child('likeCount').transaction(count => count - 1);
          this.setState({
            like: false,
            likeCount: this.state.likeCount - 1
          });
        }
      } catch(error) {
        console.log('toggleLike error ', error);
      }
    })();
  };

  _handleShare() {
    // TODO: deeplinking
    //sent out a deeplink for the particular post to all contacts??
    //for now we will send out the feed to the follower
    (async () => {
        try {
          if (!this.state.share) {
            const updateObj = this._createUpdate('share');
            this.contentRef.child('shareCount').transaction(count => count + 1);
            this.shareRef.child(this.uID).set(true);
            saveUpdateToDB(updateObj, this.uID);
            this.userNotifRef.push(updateObj);
            this.setState({
              share: true,
              shareCount: this.state.shareCount + 1
            })
          } else {
            console.log('already shared the post');
          }
      } catch(error) {
        conosle.log('share post', error);
      }
    })();
  };

  _handleSave() {
    (async () => {
      try {
        if (!this.state.saved) {
          const newCollection = {
            contentType: this.contentInfo.contentType,
            contentID: this.contentInfo.contentID,
            timestamp: Firebase.database.ServerValue.TIMESTAMP
          };
          this.contentRef.child('saveCount').transaction(count => count + 1);
          this.userCollectionsRef.set(newCollection);
        }
        this.setState({
          save: true,
          saveCount: this.state.saveCount + 1
        })
      } catch(error) {
        conosle.log('save post', error);
      }
    })();
  };

  _renderCommentBtn() {
    if (this.buttons.comment) {
      const replyCount = this.state.replyCount;
      return (
        <TouchableOpacity style={[postStyle.socialIcon, {width: 55, alignSelf: 'flex-start'}]} onPress={() =>{
            this.props.onComment(this.contentInfo);
          }
        }>
          <Icon name={(replyCount) ? "ios-chatboxes" : 'ios-chatboxes-outline'} size={this.iconSize} color={this.color}/>
          <Text style={[postStyle.iconText, {color: this.color}]}>{(replyCount) ? replyCount : ''}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  _renderLikeBtn() {
    if (this.buttons.like) {
      const likeCount = this.state.likeCount;
      const likeIcon = (this.state.ownContent) ? 'ios-heart-outline' : 'ios-heart';
      const Wrapper = (this.state.ownContent) ? View : TouchableOpacity;
      return (
        <Wrapper style={postStyle.socialIcon} onPress={this._toggleLike}>
          {(this.state.like)
            ? <Icon name={likeIcon} size={this.iconSize} color={this.color}/>
            : <Icon name="ios-heart-outline" size={this.iconSize} color={this.color}/>
          }
          <Text style={[postStyle.iconText, {color: this.color}]}>{(likeCount) ? likeCount : ''}</Text>
        </Wrapper>
      );
    }
    return null;
  };

  _renderShareBtn() {
    if (this.buttons.share) {
      const shareCount = this.state.shareCount;
      const shareIcon = (this.state.ownContent) ? 'ios-share-outline' : 'ios-share';
      return (this.state.share || this.state.ownContent)
        ? <View style={postStyle.socialIcon}>
          <Icon name={shareIcon} size={this.iconSize} color={this.color}/>
          <Text style={[postStyle.iconText, {color: this.color}]}>{(shareCount) ? shareCount : ''}</Text>
        </View>
        : <TouchableOpacity style={postStyle.socialIcon} onPress={this._handleShare}>
          <Icon name="ios-share-outline" size={this.iconSize} color={this.color}/>
          <Text style={[postStyle.iconText, {color: this.color}]}>{(shareCount) ? shareCount : ''}</Text>
        </TouchableOpacity>
    }
    return null;
  };

  _renderSaveBtn() {
    // getting rid of the save for now
    return;


    if (this.buttons.save) {
      const saveCount = this.state.saveCount;
      const saveIcon = (this.state.ownContent) ? 'ios-bookmark-outline' : 'ios-bookmark';
      return (this.state.save || this.state.ownContent)
        ? <View style={postStyle.socialIcon}>
          <Icon name={saveIcon} size={this.iconSize} color={this.color}/>
          <Text style={[postStyle.iconText, {color: this.color}]}>{(saveCount) ? saveCount : ''}</Text>
        </View>
        : <TouchableOpacity style={postStyle.socialIcon} onPress={this._handleSave}>
          <Icon name="ios-bookmark-outline" size={this.iconSize} color={this.color}/>
          <Text style={[postStyle.iconText, {color: this.color}]}>{(saveCount) ? saveCount : ''}</Text>
        </TouchableOpacity>
    }
    return null;
  };

  render() {
    return <View style={[postStyle.socialBtns, this.props.style]}>
      {this._renderCommentBtn()}
      {this._renderLikeBtn()}
      {(!this.contentInfo.isPrivateContent) ? this._renderShareBtn() : null}
      {(!this.contentInfo.isPrivateContent) ? this._renderSaveBtn() : null}
    </View>
  };
};

const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

export default connect(mapStateToProps)(SocialBtns);
