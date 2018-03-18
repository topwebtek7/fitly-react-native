import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Image
} from 'react-native';
import { getDateStringByFormat } from '../../library/convertTime';
import { FitlyBlue } from '../../styles/styles';

import DatePicker from 'react-native-datepicker';

const deviceHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const split = (deviceHeight - 130) / 5;

export default class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: 'all',
      postsOpen: false,
      postTypes: ['all', 'Workout Plan', 'Meal Plan', 'Photos', 'Others'],
      events: 'all',
      eventTypes: ['all', 'biking', 'basketball', 'jogging', 'soccer', 'yoga'],
      eventsOpen: false,
      eventsSettingsOpen: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.results = this._displayThings(nextProps.searchResults);
  }

  _toggleOpen(type) {
    if (type === 'posts') {
      this.setState({
        postsOpen: !this.state.postsOpen
      });
    } else {
      this.setState({
        eventsOpen: !this.state.eventsOpen
      });
    }
  }

  _toggleOpenEventSettings() {
    this.setState({
      eventsSettingsOpen: !this.state.eventsSettingsOpen
    });
  }

  _setPostType(type) {
    this.setState({
      posts: type,
      postsOpen: false
    });
  }

  _setEventType(type) {
    this.setState({
      events: type,
      eventsOpen: false
    });
  }

  _renderPostHeader() {
    return (
      <View
        style={{
          flex: 1,
          zIndex: 10,
          position: 'absolute',
          top: 10,
          right: 30,
          alignItems: 'flex-end'
        }}
      >
        <Text onPress={() => this._toggleOpen('posts')}>
          Category:{' '}
          <Text style={{ color: 'blue', fontWeight: 'bold' }}>
            {this.state.posts}
          </Text>
        </Text>
        {this.state.postsOpen
          ? this.state.postTypes.map((type, i) => {
              if (type === this.state.posts) return null;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => this._setPostType(type)}
                >
                  <Text style={{ color: 'blue', marginTop: 5 }}>{type}</Text>
                </TouchableOpacity>
              );
            })
          : null}
      </View>
    );
  }

  _renderEventsHeader() {
    return (
      <View
        style={{
          flex: 1,
          zIndex: 10,
          position: 'absolute',
          top: 10,
          right: 30,
          alignItems: 'flex-end'
        }}
      >
        <Text onPress={() => this._toggleOpen('events')}>
          Category:{' '}
          <Text style={{ color: 'blue', fontWeight: 'bold' }}>
            {this.state.events}
          </Text>
        </Text>
        {this.state.eventsOpen
          ? this.state.eventTypes.map((type, i) => {
              if (type === this.state.events) return null;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => this._setEventType(type)}
                >
                  <Text style={{ color: 'blue', marginTop: 5 }}>{type}</Text>
                </TouchableOpacity>
              );
            })
          : null}
      </View>
    );
  }

  _renderEventsHeaderNew() {
    return (
      <View
        style={{
          flex: 1,
          zIndex: 10,
          position: 'absolute',
          top: 10,
          right: 30,
          alignItems: 'flex-end'
        }}
      >
        <Text
          onPress={() => this._toggleOpenEventSettings()}
          style={{ color: 'blue', fontWeight: 'bold' }}
        >
          Settings
        </Text>
      </View>
    );
  }

  _displayThings(results) {
    if (
      results[this.props.content] === 'no results' ||
      (results[this.props.content].length === 1 &&
        results[this.props.content][0]._id === this.props.uID)
    )
      return this._renderNoResults();
    return Object.keys(results).map((content, key) => {
      let things = results[content];
      return (
        <View
          key={key}
          style={{ flex: 1, backgroundColor: 'white', flexDirection: 'column' }}
        >
          <ScrollView
            style={{ backgroundColor: 'white', flexDirection: 'column' }}
          >
            {things.map((thing, k) => {
              let last = k === things.length - 1;
              switch (thing._type) {
                case 'user':
                  return this._renderUser(thing._source, thing._id, k, last);
                  break;
                case 'post':
                  return this._renderPost(thing._source, thing._id, k, last);
                  break;
                case 'event':
                  return this._renderEvent(thing._source, thing._id, k, last);
                  break;
                case 'tag':
                  return this._renderTag(thing, k, last);
                  break;
                default:
              }
            })}
            {things.length && !this.props.endReached
              ? this._renderFooter(content)
              : null}
          </ScrollView>
        </View>
      );
    });
  }

  _renderUser(data, id, k, last) {
    let style = { flexGrow: 1, marginLeft: 30, marginTop: 10 };
    if (!k) style['marginTop'] = 30;
    if (last) style['marginBottom'] = 30;
    if (id === this.props.uID) return null;
    return (
      <View style={style} key={data.dateJoined + k}>
        <TouchableOpacity onPress={() => this.props.goToProfile(id)}>
          <View style={Search.row}>
            <Image
              style={
                data.account === 'trainer'
                  ? Search.trainerPic
                  : Search.profilePic
              }
              source={{ uri: data.picture }}
            />
            <Text>{data.first_name + ' ' + data.last_name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderPost(data, id, k, last) {
    let style = { flexGrow: 1, marginLeft: 30, marginTop: 10 };
    if (!k) style['marginTop'] = 30;
    if (last) style['marginBottom'] = 30;
    let imgLink = data.photos
      ? data.photos[Object.keys(data.photos)[0]].link
      : null;
    if (this.state.posts !== 'all' && data.category !== this.state.posts) {
      return;
    } else {
      return (
        <View style={style} key={data.createdAt + k}>
          <TouchableOpacity onPress={() => this.props.goToPost(id)}>
            <View style={Search.row}>
              <Image style={Search.postPic} source={{ uri: imgLink }} />
              <View style={Search.column}>
                <Text>{data.title}</Text>
                <Text>{data.authorName}</Text>
                <Text>{data.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }

  _renderEvent(data, id, k, last) {
    let style = { flexGrow: 1, marginLeft: 30, marginTop: 10 };
    if (!k) style['marginTop'] = 30;
    if (last) style['marginBottom'] = 30;
    if (this.state.events !== 'all' && data.category !== this.state.events) {
      return;
    } else {
      return (
        <View style={style} key={data.createdAt + k}>
          <TouchableOpacity
            onPress={() =>
              this.props.goToEvent(Object.assign({}, data, { contentID: id }))
            }
          >
            <View style={Search.row}>
              <Image
                style={Search.eventPic}
                source={{ uri: data.backgroundImage }}
              />
              <View style={Search.column}>
                <Text>{data.title}</Text>
                <Text>Category: {data.category}</Text>
                <Text>
                  When:{' '}
                  {getDateStringByFormat(data.startDate, 'ddd, MMM Do, h:mm A')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }

  _renderTag(data, k, last) {
    let tag = data._id;
    let style = { flexGrow: 1, marginLeft: 30, marginTop: 10 };
    if (!k) style['marginTop'] = 30;
    if (last) style['marginBottom'] = 30;
    return (
      <View style={style} key={tag}>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('TaggedView', {
              tag,
              FitlyFirebase: this.props.FitlyFirebase
            });
          }}
        >
          <View style={Search.column}>
            <Text style={{ fontSize: 18 }}># {tag}</Text>
            <Text style={{ fontSize: 12, color: 'grey' }}>
              {data._source.count} tagged with {tag}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderFooter(section) {
    let style = { flexGrow: 1, marginLeft: 30 };
    return (
      <View style={style} key={section}>
        <TouchableOpacity onPress={() => this.props.getMore(null, true)}>
          <View style={Search.footer}>
            <Text>Load More</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderNoResults() {
    return <Text>No Results Were Found</Text>;
  }

  _renderEventSettings() {
    const settings = this.props.eventSearchSettings;

    return (
      <View
        style={{
          backgroundColor: 'red',
          height: 200,
          flexDirection: 'column',
          justifyContent: 'space-around',
          paddingLeft: 10
        }}
      >
        <Text style={{ fontSize: 20 }}>
          Distance: {settings.distance} miles
        </Text>
        <Text style={{ fontSize: 20 }}>
          From: {settings.fromTime ? settings.fromTime : 'anytime'}
        </Text>
        <Text style={{ fontSize: 20 }}>
          To: {settings.toTime ? settings.toTime : 'anytime'}
        </Text>
        <Text style={{ fontSize: 20 }}>
          Category: {settings.category.length > 1 ? 'All' : settings.category}
        </Text>
      </View>
    );
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: 'white',
          flexGrow: 1,
          marginBottom: 50,
          flexDirection: 'column'
        }}
      >
        {this.props.content === 'events' ? this._renderEventsHeader() : null}
        {this.props.content === 'posts' ? this._renderPostHeader() : null}
        {this.state.eventsSettingsOpen ? this._renderEventSettings() : null}
        {this.props.searching ? (
          <ActivityIndicator
            animating={this.props.searching}
            style={{ height: 80 }}
            size="large"
          />
        ) : (
          this._displayThings(this.props.searchResults)
        )}
      </View>
    );
  }
}

const Search = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  profilePic: {
    borderRadius: 30,
    borderColor: FitlyBlue,
    borderWidth: 2,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: FitlyBlue,
    shadowOpacity: 0.5,
    elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2
  },
  trainerPic: {
    borderRadius: 30,
    borderColor: '#FF0000',
    borderWidth: 2,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: '#FF0000',
    shadowOpacity: 0.5,
    elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2
  },
  postPic: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: FitlyBlue,
    shadowOpacity: 0.5,
    elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2
  },
  eventPic: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: FitlyBlue,
    shadowOpacity: 0.5,
    elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2
  },
  row: {
    flexGrow: 1,
    width: screenWidth - 30,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center'
  },
  footer: {
    flexGrow: 1,
    height: 30,
    marginBottom: 10,
    width: screenWidth - 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  column: {
    flexGrow: 1,
    width: screenWidth - 30,
    height: 72,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
});
