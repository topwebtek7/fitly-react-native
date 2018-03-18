import React, {Component} from 'react';
import { postStyle, feedEntryStyle, composeStyle, headerStyle } from '../../styles/styles.js';
import { Modal, View, TextInput, Text, StatusBar, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { push } from '../../actions/navigation.js';
import {saveUpdateToDB, turnOnCommentListener, turnOffCommentListener} from '../../library/firebaseHelpers.js'
import TimeAgo from 'react-native-timeago';
import SocialBtns from '../SocialBtns.js'
import Author from '../Author.js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class CommentsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      route: this.props.route
    };

    this.props.route;
    this.props.pushRoute;

    this.user = this.props.user;
    this.uID = this.props.uID;
    this.database = this.props.FitlyFirebase.database();
    this.msgRef = this.database.ref('messages');
    this.isPrivateContent = this.props.isPrivateContent;

    this.commentsRef = this._setCommentsRef(this.props.route);
    this._onComment = this._onComment.bind(this);
  }

  _setCommentsRef(route, options = {initialize: true}) {
    const {contentType, contentID} = route;
    if (!options.initialize) {
      this.setState({route: route, comments: []});
    }
    if (contentType === 'post') {
      return this.database.ref('postComments').child(contentID);
    } else if (contentType === 'message') {
      return this.database.ref('messages').child(contentID).child('replies');
    } else if (contentType === 'photo') {
      return this.database.ref('photos').child(contentID).child('replies');
    } else if (contentType === 'event') {
      return this.database.ref('eventComments').child(contentID);
    }
  }

  componentDidMount() {
    this._turnOnCommentListener(this.commentsRef);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.route.contentID !== this.state.route.contentID) {
      turnOffCommentListener(this.commentsRef);
      this.commentsRef = this._setCommentsRef(nextProps.route, {initialize: false});
      this._turnOnCommentListener(this.commentsRef);
    }
  }

  componentWillUnmount() {
    turnOffCommentListener(this.commentsRef);
  };

  _turnOnCommentListener(commentsRef) {
    const handleNewComment = (msgKey) => {
      this.msgRef.child(msgKey).once('value')
      .then(msgSnap => {
        let commentCopy = this.state.comments.slice();
        let newMsg = msgSnap.val();
        newMsg.key = msgKey;
        commentCopy.push(newMsg);
        this.setState({comments: commentCopy});
      });
    };

    const handleComments = (msgKeys) => {
      msgKeys.forEach((msgKey, index) => {
        this.msgRef.child(msgKey).once('value')
        .then(msgSnap => {
          let commentCopy = this.state.comments.slice();
          let msgObj = msgSnap.val();
          msgObj.key = msgKey;
          commentCopy[index] = msgObj;
          this.setState({comments: commentCopy});
        });
      })
    };
    turnOnCommentListener(commentsRef, handleComments, handleNewComment);
  };

  _onComment(route) {
    this.props.openModal && this.props.openModal();
    this.props.pushRoute(route);
  }

  _onPhotoPress(comment) {
    const route = {
      contentID: comment.photo.key,
      contentType: 'photo',
      parentAuthor: comment.author,
      isPrivateContent: this.props.isPrivateContent
    };
    this._onComment(route);
  }

  _renderSocialBtns(content) {
    let contentInfo = {
      contentType: 'message',
      contentID: content.key,
      parentAuthor: content.author,
      isPrivateContent: this.props.isPrivateContent
    };
    return (
      <SocialBtns
        contentInfo={contentInfo}
        buttons={{comment: true, like: true, share: true, save: true}}
        onComment={this._onComment}
        content={content}
      />
    )
  };

  render() {
    return (
      <View style={{marginBottom: 20}}>
        {(this.state.comments && this.state.comments.length === 0)
          ? <Text style={{marginTop: 20, textAlign: 'center', color: '#ccc'}}>Be the first to comment</Text>
          : null}
        {this.state.comments.map((comment, index) => {
          if (comment) {
            return (
              <View key={comment.key + index} style={{borderBottomWidth: .5, borderColor: '#ccc'}}>
                <Author uID={this.props.uID} content={comment} style={{marginLeft: 15, marginTop: 15}} screenProps={this.props.screenProps} navigation={this.props.navigation}/>
                <TimeAgo style={feedEntryStyle.timestamp} time={comment.createdAt}/>
                <View style={postStyle.postContent}>
                  {(comment.photo)
                    ? <TouchableOpacity style={feedEntryStyle.imagesTouchable}
                        onPress={() => this._onPhotoPress(comment)}>
                        <Image style={feedEntryStyle.images} source={{uri: comment.photo.link}} style={feedEntryStyle.images} defaultSource={require('../../../img/default-photo-image.png')}/>
                      </TouchableOpacity>
                    : <Text style={postStyle.content}>{comment.content}</Text>}
                </View>
                {this._renderSocialBtns(comment)}
              </View>
            )
          } else {
            return (
              <View key={comment.key + index}>
                <ActivityIndicator animating={true} style={{height: 80}} size="small"/>
              </View>
            )
          }
        })}
        <View style={{height: (this.state.comments && this.state.comments.length === 0) ? 10 : 50}}></View>
      </View>
    );
  }
};


const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentsView);
