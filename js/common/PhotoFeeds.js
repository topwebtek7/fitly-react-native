import React, { Component } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity } from 'react-native';
import { feedEntryStyle } from '../styles/styles.js';
import { push } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TimeAgo from 'react-native-timeago';
let screenWidth = Dimensions.get('window').width;

class PhotoFeed extends Component {
  constructor(props) {
    super(props);

    //TODO: settings will dictate what kind of feed should trigger a push notification and should be rendered
  }

  _renderPhotos(feed) {
    const picSize = screenWidth/3 - 2
    return feed.photos.map((photo, index) => {
      return (
        <TouchableOpacity style={{height: picSize, width: picSize, marginBottom: 2, marginLeft:1, marginRight: 1}}  key={'feedPhotos' + index}
          onPress={() => {
            console.log('keyyy', feed);
            {/* this.props.navigation.navigate("ImageView", {photoID: photo.key})} */}
            this.props.navigation.navigate("PostImagesView", {photos: feed.photos, postId: feed.contentID, fromFeeds: true})
          }}>
          <Image style={[feedEntryStyle.photoFeedEntry, {width: picSize, height: picSize}]} source={{uri: photo.link}} defaultSource={require('../../img/default-photo-image.png')}/>
          <View style={{position: 'absolute', left: 1, right: 0, bottom: 0, height: 40, width: picSize, backgroundColor: "rgba(0,0,0,0.5)"}}>
            <Text style={[feedEntryStyle.smallDescription, {color: 'white', paddingRight: 10, paddingTop: 10, bottom: 0}]}>{this.props.profile ? (feed.contentTitle.length > 18 ? feed.contentTitle.slice(0,18)+'...\n' : feed.contentTitle+'\n') : feed.ownerName + ' \nposted '}
              <TimeAgo time={feed.timestamp}/>
            </Text>
          </View>
        </TouchableOpacity>
      );
    })
  };

  render() {
    if (this.props.feeds.length > 0) {
      return (
        <View style={feedEntryStyle.photoFeedContainer}>
          {this.props.feeds.filter(feed => !!feed.photos)
          .map((feed, index) => this._renderPhotos(feed))}
        </View>
      );
    } else {
      return (
        <View style={{flex: 0}}>
          <Text style={{textAlign: 'center', color: '#ccc', marginTop: 30, marginLeft: 30, marginRight: 30}}>Your feeds are empty, let's find someone you want to follow</Text>
        </View>
      );
    }
  };
};

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

export default connect(mapStateToProps, mapDispatchToProps)(PhotoFeed);
