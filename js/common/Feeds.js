import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { feedEntryStyle } from '../styles/styles.js';
import { push } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TimeAgo from 'react-native-timeago';
import Author from './Author.js';
import {
  getWeekdayMonthDay,
  getHrMinDuration
} from '../library/convertTime.js';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

class Feeds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      details: false,
      hide: {}
    };
    this.profile = this.props.profile;
    // TODO: settings will dictate what kind of feed should trigger a push notification and should be rendered
  }

  _renderUpdateMsg(feed) {
    let description;
    const article =
      feed.contentType && 'aeiou'.indexOf(feed.contentType[0]) > -1
        ? 'an'
        : 'a';
    if (feed.type === 'post') {
      description = `posted a new ${feed.description}`;
    } else if (feed.type === 'follow') {
      description = 'followed';
    } else if (feed.type === 'share') {
      const artical = feed.contentType;
      description = `shared ${article} ${feed.contentType}`;
    } else if (feed.type === 'event') {
      if (feed.organizers[feed.ownerID]) {
        description = 'created an event';
      } else {
        description = 'shared an event';
      }
    } else if (feed.type === 'like') {
      description = `liked ${article} ${feed.contentType}`;
    }
    return <Text style={feedEntryStyle.description}>{description}</Text>;
  }

  _renderPhotos(feed) {
    const { photos = [] } = feed;
    const { contentID } = feed;

    return (
      <View style={feedEntryStyle.imgContainer}>
        {photos.map((photo, index) => (
          <TouchableOpacity
            style={feedEntryStyle.imagesTouchable}
            key={`feedPhotos${index}`}
            onPress={() =>
              this.props.navigation.navigate('PostImagesView', {
                photos,
                selectedKey: photo.key,
                postId: contentID,
                fromFeeds: true
              })
            }
          >
            <Image
              style={feedEntryStyle.images}
              source={{ uri: photo.link }}
              style={feedEntryStyle.images}
              defaultSource={require('../../img/default-photo-image.png')}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  _renderPostFeedEntry(feed) {
    return (
      <View style={{ flex: 0 }}>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate('PostView', {
              postID: feed.contentID
            })
          }
        >
          {feed.contentTitle ? (
            <Text style={{ marginVertical: 5 }}>{feed.contentTitle}</Text>
          ) : null}
          {feed.contentSnipet ? (
            <Text style={{ marginBottom: 5 }}>
              {`${feed.contentSnipet}...`}
            </Text>
          ) : null}
        </TouchableOpacity>
        {this._renderPhotos(feed)}
      </View>
    );
  }

  _renderActivityEntry(feed) {
    const startDate = new Date(feed.startDate);
    const endDate = new Date(feed.endDate);
    const isAdmin =
      (feed.organizers && !!feed.organizers[this.props.uID]) || false;
    return (
      <View style={{ flex: 0 }}>
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate('EventScene', {
              eventID: feed.contentID,
              isAdmin
            })
          }
        >
          <Text
            style={{
              paddingBottom: 10,
              alignSelf: 'stretch',
              textAlign: 'center'
            }}
          >
            {feed.contentTitle}
          </Text>
          {
            // <Text style={{marginBottom: 5}}>{feed.contentSnipet + '...'}</Text>
            // <Text style={{marginBottom: 5}}>{getWeekdayMonthDay(startDate)}</Text>
            // <Text style={{marginBottom: 5}}>{getHrMinDuration(startDate, endDate)}</Text>
            // <Text style={{marginBottom: 5}}>{feed.location.placeName}</Text>
            // <Text style={{marginBottom: 5}}>{feed.location.address}</Text>
          }
        </TouchableOpacity>
        {this._renderPhotos(feed.photos)}
      </View>
    );
  }

  _renderFeedEntryContent(feed) {
    if (feed.type === 'post') {
      return this._renderPostFeedEntry(feed);
    } else if (feed.type === 'follow') {
      return (
        <TouchableOpacity
          style={[
            feedEntryStyle.profileRow,
            //{ flexDirection: 'row', justifyContent: 'flex-end' },
            { top: -25, justifyContent: 'flex-end' }
          ]}
          onPress={this._goToProfile.bind(this, feed.followingID)}
        >
          <Text style={[feedEntryStyle.username, { marginRight: 10 }]}>
            {feed.followingName}
          </Text>
          <Image
            source={
              feed.followingPicture
                ? { uri: feed.followingPicture }
                : require('../../img/default-user-image.png')
            }
            style={[
              feedEntryStyle.defaultImg,
              { borderRadius: 25, width: 50, height: 50 }
            ]}
            defaultSource={require('../../img/default-user-image.png')}
          />
        </TouchableOpacity>
      );
    } else if (feed.type === 'share') {
      if (feed.contentType === 'post') {
        return (
          <View style={{ flex: 0, marginLeft: 30 }}>
            {this._renderPostFeedEntry(feed)}
          </View>
        );
      } else if (feed.contentType === 'event') {
        return (
          <View style={{ flex: 0, marginLeft: 30 }}>
            {this._renderActivityEntry(feed)}
          </View>
        );
      }
    } else if (feed.type === 'like') {
      if (feed.contentType === 'post') {
        return (
          <View style={{ flex: 0, marginLeft: 30 }}>
            {this._renderPostFeedEntry(feed)}
          </View>
        );
      } else if (feed.contentType === 'event') {
        return (
          <View style={{ flex: 0, marginLeft: 30 }}>
            {this._renderActivityEntry(feed)}
          </View>
        );
      }
    } else if (feed.type === 'event') {
      return this._renderActivityEntry(feed);
    }
  }

  _goToProfile(id) {
    if (id === this.props.uID || id === this.props.viewing) {
    } else {
      this.props.navigation.navigate('ProfileEntry', {
        otherUID: id
      });
    }
  }

  _renderMenu() {
    const feedKey = {};
    feedKey[this.state.details.feedKey] = true;
    return (
      <View
        style={{
          position: 'absolute',
          top: 10,
          right: 60,
          borderColor: '#aaa',
          borderWidth: 1,
          flex: 1,
          flexDirection: 'column',
          zIndex: 200,
          backgroundColor: '#fff',
          width: 100,
          padding: 10,
          shadowColor: 'black',
          shadowOpacity: 0.6,
          elevation: 2,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 2
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.removeFeedItem(this.state.details);
            this.setState({
              menuOpen: false,
              hide: Object.assign({}, this.state.hide, feedKey)
            });
          }}
        >
          <Text>Hide</Text>
        </TouchableOpacity>
      </View>
    );
  }

  removeFeedItem(details) {
    this.props.FitlyFirebase.database()
      .ref(`feeds/${this.props.uID}/${details.feedKey}`)
      .remove();
  }

  _renderMenuButton(id, feed) {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: 'transparent'
        }}
        onPress={() => {
          this.setState({
            menuOpen:
              this.state.menuOpen && this.state.menuOpen === id ? false : id,
            details: feed
          });
        }}
      >
        <Icon name="ios-more" size={30} color="gray" />
      </TouchableOpacity>
    );
  }

  render() {
    if (this.props.feeds.length > 0) {
      return (
        <View style={{ flex: 0, alignSelf: 'stretch' }}>
          {this.props.feeds.map((feed, index) => {
            if (this.state.hide[feed.feedKey]) return;
            return (
              <View style={feedEntryStyle.container} key={`feed${index}`}>
                <TouchableOpacity
                  onPress={() => this._goToProfile(feed.ownerID)}
                  style={[feedEntryStyle.profileRow, { marginBottom: 0 }]}
                >
                  <Image
                    source={
                      feed.ownerPicture
                        ? { uri: feed.ownerPicture }
                        : require('../../img/default-user-image.png')
                    }
                    style={feedEntryStyle.defaultImg}
                    defaultSource={require('../../img/default-user-image.png')}
                  />
                  <View>
                    <Text style={feedEntryStyle.username}>
                      {feed.ownerName}
                    </Text>
                    {this._renderUpdateMsg(feed)}
                  </View>
                </TouchableOpacity>
                <TimeAgo
                  style={feedEntryStyle.timestamp}
                  time={feed.timestamp}
                />

                {this.profile
                  ? null
                  : this._renderMenuButton(feed.contentID, feed)}
                {this.state.menuOpen === feed.contentID
                  ? this._renderMenu()
                  : null}
                {this._renderFeedEntryContent(feed)}
              </View>
            );
          })}
        </View>
      );
    }
    return (
      <View style={{ flex: 1, width: screenWidth }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#ccc',
            marginTop: 30,
            marginLeft: 30,
            marginRight: 30
          }}
        >
          Your feeds are empty, let's find someone you want to follow
        </Text>
      </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Feeds);
