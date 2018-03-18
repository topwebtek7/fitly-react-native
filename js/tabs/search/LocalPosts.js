import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ListView,
  Image,
  ActivityIndicator
} from 'react-native';
import { getWeekdayMonthDay } from '../../library/convertTime';

import { NavigationActions } from 'react-navigation';

const screenWidth = Dimensions.get('window').width;
const picSize = screenWidth / 3 - 2;

export default class LocalPosts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestPosts: this.props.latestPosts,
      content: this.props.content,
      loading: this.props.loading,
      imageLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      content: nextProps.content,
      loading: nextProps.loading,
      latestPosts: nextProps.latestPosts
    });
  }

  _fetchPosts() {
    this.props.FitlyFirebase.database()
      .ref('posts')
      .once('value')
      .then(posts => {
        this.setState({ latestPosts: posts.val() });
      });
  }

  _renderHeader() {
    return null;
  }

  _renderPostContainer = () => {
    if (this.props.exploring !== 'Posts') {
      const contentData = this.props.content.reduce(
        (accumulator, currentValue) => {
          const newVal = {
            contentID: currentValue.contentID,
            contentType: currentValue.contentType,
            photos: currentValue.photos,
            authorName: currentValue.authorName,
            backgroundImage: currentValue.backgroundImage,
            title: currentValue.title
          };
          accumulator.push(newVal);
          return accumulator;
        },
        []
      );

      if (!contentData.length) return null;

      return (
        <ListView
          dataSource={contentData}
          numColumns={3}
          renderRow={this._renderTag}
        />
      );
    }

    const postKeys = Object.keys(this.props.latestPosts)
      .reverse()
      .reduce((accum, currentVal) => {
        const newVal = {
          contentID: currentVal,
          key: currentVal
        };
        accum.push(newVal);
        return accum;
      }, []);

    const postDataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => {
        row1.contentID !== row2.contentID;
      }
    }).cloneWithRows(postKeys);

    return (
      <ListView
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          maxWidth: screenWidth
        }}
        horizontal
        dataSource={postDataSource}
        numColumns={3}
        renderRow={this._renderPostWithListView}
      />
    );
  };

  _renderPosts() {
    // console.log('exploring?', Object.keys(this.props.latestPosts));
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}
      >
        {this.props.exploring !== 'Posts'
          ? this.props.content.map((content, i) => this._renderTag(content, i))
          : Object.keys(this.props.latestPosts)
              .reverse()
              .map(post => this._renderPost(post))}
      </View>
    );
  }

  _renderFetchMore() {
    return (
      <TouchableOpacity onPress={this.props.fetchMore.bind(this)}>
        <View
          style={{
            flex: 1,
            marginBottom: 20,
            marginTop: 10,
            marginLeft: picSize * 2
          }}
        >
          <Text>Load More</Text>
        </View>
      </TouchableOpacity>
    );
  }

  _renderTag(content, key) {
    const contentID = content.contentID;
    const contentType = content.contentType;
    let photo, authorName;
    if (contentType === 'post') {
      photo =
        content.photos && Object.keys(content.photos).length
          ? content.photos[Object.keys(content.photos)[0]].link
          : null;
      authorName = content.authorName;
    } else {
      photo = content.backgroundImage;
    }
    return (
      <View
        style={{
          height: picSize,
          width: picSize,
          marginBottom: 2,
          marginLeft: 1,
          marginRight: 1
        }}
        key={key}
      >
        <TouchableOpacity
          onPress={
            contentType === 'post'
              ? this._goToPost.bind(this, contentID)
              : this._goToEvent.bind(this, content)
          }
        >
          <Image
            source={
              photo
                ? { uri: photo }
                : require('../../../img/default-photo-image.png')
            }
            style={{ height: picSize, width: picSize }}
          />
          <View
            style={{
              position: 'absolute',
              width: picSize,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              height: 40,
              flexDirection: 'column',
              paddingLeft: 10,
              paddingBottom: 5,
              alignItems: 'flex-start',
              justifyContent: 'flex-end'
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10 }}>
              {authorName || `Event - ${getWeekdayMonthDay(content.startDate)}`}
            </Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>
              {content.title.length > 18
                ? `${content.title.slice(0, 18)}...`
                : content.title || null}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderPostWithListView = data => this._renderPost(data.contentID);

  _renderPost(contentID) {
    const post = this.props.latestPosts[contentID];
    const photo =
      post.photos && Object.keys(post.photos).length
        ? post.photos[Object.keys(post.photos)[0]].link
        : false;
    return (
      <View
        style={{
          height: picSize,
          width: picSize,
          marginBottom: 2,
          marginLeft: 1,
          marginRight: 1
        }}
        key={contentID}
      >
        <TouchableOpacity onPress={this._goToPost.bind(this, contentID)}>
          <Image
            source={
              photo
                ? { uri: photo }
                : require('../../../img/default-photo-image.png')
            }
            onLoadStart={(() => {
              this.setState({ imageLoading: true });
            }).bind(this)}
            onLoadEnd={(() => {
              this.setState({ imageLoading: false });
            }).bind(this)}
            style={{ height: picSize, width: picSize }}
          >
            <ActivityIndicator
              animating={this.state.imageLoading}
              style={{ height: 80 }}
              size="large"
            />
          </Image>
        </TouchableOpacity>
      </View>
    );
  }

  _goToPost(contentID) {
    this.props.navigation.navigate('PostView', { postID: contentID });
    // const resetToPostAction = NavigationActions.reset({
    //   index: 0,
    //   actions: [
    //     NavigationActions.navigate({ routeName: "Profile" }),
    //     NavigationActions.navigate({ routeName: "PostView", params: { postID: contentID }}),
    //   ]
    // });

    // this.props.navigation.dispatch(resetToPostAction);
    // this.props.screenProps.tabNavigation.navigate("Profile")
  }

  _goToEvent(content) {
    const isAdmin =
      (content.organizers && !!content.organizers[this.props.uID]) || false;
    this.props.navigation.navigate('EventScene', {
      eventID: content.contentID,
      isAdmin
    });
  }

  //  Flat List need to fix
  //   render() {
  //     return (
  //       <View style={{ flex: 1 }}>
  //         {this._renderHeader()}

  //         {this._renderPostContainer()}

  //         {this.props.latestPostsEnd || this.props.exploring !== 'Posts'
  //           ? null
  //           : this._renderFetchMore()}
  //       </View>
  //     );
  //   }

  render() {
    // console.log('rendering');
    return (
      <View style={{ flex: 1 }}>
        {this._renderHeader()}
        <ScrollView
          style={{ backgroundColor: 'white' }}
          showsVerticalScrollIndicator={false}
        >
          {this.props.loading ? (
            <ActivityIndicator
              animating={this.props.loading}
              style={{ height: 80 }}
              size="large"
            />
          ) : (
            this._renderPosts()
          )}
        </ScrollView>
      </View>
    );
  }
}
