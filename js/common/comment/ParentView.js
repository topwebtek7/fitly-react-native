import React, { Component } from 'react';
import { postStyle, feedEntryStyle, eventStyle } from '../../styles/styles.js';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { push } from '../../actions/navigation.js';
import TimeAgo from 'react-native-timeago';
import SocialBtns from '../SocialBtns.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Author from '../Author.js';
import { convertFBObjToArray } from '../../library/firebaseHelpers.js';
import FitImage from '../../library/FitImage.js';

class ParentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
      like: false,
      shared: false,
      saved: false,
      route: this.props.route
    };

    this.uID = this.props.uID;
    this.database = this.props.FitlyFirebase.database();
  }

  componentDidMount() {
    this._getContent(this.props.route);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.route.contentID !== this.state.route.contentID) {
      this._getContent(nextProps.route);
    }
  }

  _getContent(route) {
    this.setState({ route: route, content: null });
    const { contentType, contentID } = route;
    this.contentRef = this.database.ref(contentType + 's').child(contentID);
    this.contentRef.once('value').then(snap => {
      let contentObj = snap.val();
      if (contentObj.photos) {
        contentObj.photos = convertFBObjToArray(snap.child('photos'));
      }
      contentObj.tags = Object.keys(contentObj.tags || {});
      this.setState({
        content: contentObj
      });
    });
  }

  _renderPhotos(content) {
    return (
      <View style={{ left: -18, right: -18, flexDirection: 'row' }}>
        {content.photos.map((photo, index) => {
          const route = {
            contentID: photo.key,
            contentType: 'photo',
            authorName: content.author
          };
          return (
            <TouchableOpacity
              style={postStyle.imagesTouchable}
              key={'postPhotos' + index}
              onPress={() => this.props.pushRoute(route)}
            >
              <Image
                style={postStyle.images}
                source={{ uri: photo.link }}
                defaultSource={require('../../../img/default-photo-image.png')}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  _renderTags(tags) {
    return (
      <View style={postStyle.tagsRow}>
        {tags.map((tag, index) => {
          return (
            <Text style={postStyle.tags} key={'tag' + index}>
              #{tag}
            </Text>
          );
        })}
      </View>
    );
  }

  _renderPost(content) {
    return (
      <View style={postStyle.postContainer}>
        <Author
          navigation={this.props.navigation}
          uID={this.props.uID}
          content={content}
          style={{ marginLeft: 15 }}
          nonClickable={true}
        />
        <TimeAgo style={feedEntryStyle.timestamp} time={content.createdAt} />
        <View style={postStyle.postContent}>
          <Text style={postStyle.title}>{content.title}</Text>
          <Text style={postStyle.textContent}>{content.content}</Text>
          {this._renderPhotos(content)}
          {this._renderTags(content.tags)}
          <SocialBtns
            contentInfo={this.props.route}
            content={this.state.content}
            buttons={{ like: true, share: true, save: true }}
          />
        </View>
      </View>
    );
  }

  _renderMsg(content) {
    return (
      <View style={postStyle.postContainer}>
        <Author
          navigation={this.props.navigation}
          uID={this.props.uID}
          style={{ marginLeft: 15 }}
          content={content}
          nonClickable={true}
        />
        <TimeAgo style={feedEntryStyle.timestamp} time={content.createdAt} />
        {content.photo ? (
          <Image
            style={feedEntryStyle.images}
            source={{ uri: content.photo.link }}
            style={feedEntryStyle.images}
            defaultSource={require('../../../img/default-photo-image.png')}
          />
        ) : (
          <Text style={[postStyle.content, { marginLeft: 30 }]}>
            {content.content}
          </Text>
        )}
        <SocialBtns
          contentInfo={this.props.route}
          content={this.state.content}
          buttons={{ like: true, share: true, save: true }}
        />
      </View>
    );
  }

  _renderPhoto(content) {
    const { width, height } = Dimensions.get('window');
    return (
      <View style={postStyle.postContainer}>
        <Author
          navigation={this.props.navigation}
          uID={this.props.uID}
          style={{ marginLeft: 15 }}
          content={content}
          nonClickable={true}
        />
        <TimeAgo
          style={[feedEntryStyle.timestamp, { right: 15 }]}
          time={content.createdAt}
        />
        <FitImage
          style={{ width: width }}
          resizeMode="cover"
          source={{ uri: content.link }}
        />
        <Text style={postStyle.content}>{content.description}</Text>
        {this._renderTags(content.tags)}
        <SocialBtns
          contentInfo={this.props.route}
          content={this.state.content}
          buttons={{ like: true, share: true, save: true }}
        />
      </View>
    );
  }

  _renderEvent(content) {
    return (
      <View style={postStyle.postContainer}>
        <Text style={{ textAlign: 'center' }}>{content.title}</Text>
        <Text style={{ textAlign: 'center' }}>Disscusion</Text>
      </View>
    );
  }

  render() {
    const { contentType, contentID } = this.state.route;
    const { content } = this.state;
    if (!content) {
      return (
        <ActivityIndicator
          animating={true}
          style={{ height: 80 }}
          size="small"
        />
      );
    } else if (contentType === 'post') {
      return this._renderPost(content);
    } else if (contentType === 'message') {
      return this._renderMsg(content);
    } else if (contentType === 'photo') {
      return this._renderPhoto(content);
    } else if (contentType === 'event') {
      return this._renderEvent(content);
    }
  }
}

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ParentView);
