import React, { Component } from 'react';
import { Text, Dimensions, ScrollView, Platform } from 'react-native';
import { TabViewAnimated, TabBarTop, TabViewPagerScroll, TabViewPagerPan } from 'react-native-tab-view';
import Feeds from './Feeds.js';
import PhotoFeeds from './PhotoFeeds.js';

const screenWidth = Dimensions.get('window').width;
import { profileStyle } from '../styles/styles.js';

export default class FeedTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [{ key: '1', title: 'Feed' }, { key: '2', title: 'Photos' }],
    };
  }

  _handleChangeTab = index => {
    this.setState({ index });
  };

  _renderHeader = props => {
    const indicatorWidth = 65;
    const marginleft = screenWidth / 4 - indicatorWidth / 2;
    return (
      <TabBarTop
        {...props}
        style={{ backgroundColor: 'white' }}
        labelStyle={{ fontSize: 14, color: 'grey' }}
        indicatorStyle={{
          backgroundColor: '#326fd1',
          alignSelf: 'center',
          marginLeft: marginleft,
          width: indicatorWidth,
        }}
      />
    );
  };

  _renderScene = ({ route }) => {
    switch (route.key) {
      case '1':
        if (this.props.profile) {
          return (
            <Feeds
              screenProps={this.props.screenProps}
              navigation={this.props.navigation}
              feeds={this.props.feeds}
              profile={this.props.profile}
              viewing={this.props.viewing}
            />
          );
        }
        return (
          <ScrollView
            style={{ flex: 1, backgroundColor: 'white', marginBottom: 50 }}
            contentContainerStyle={profileStyle.container}
          >
            <Feeds
              screenProps={this.props.screenProps}
              navigation={this.props.navigation}
              feeds={this.props.feeds}
              profile={this.props.profile}
              viewing={this.props.viewing}
            />
          </ScrollView>
        );

      case '2':
        if (this.props.profile) {
          return (
            <PhotoFeeds
              screenProps={this.props.screenProps}
              navigation={this.props.navigation}
              feeds={this.props.feeds}
              profile={this.props.profile}
            />
          );
        }
        return (
          <ScrollView
            style={{ flex: 1, backgroundColor: 'white', marginBottom: 50 }}
            contentContainerStyle={profileStyle.container}
          >
            <PhotoFeeds
              screenProps={this.props.screenProps}
              navigation={this.props.navigation}
              feeds={this.props.feeds}
              profile={this.props.profile}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  _renderPager = (props) => {
    return <TabViewPagerScroll {...props} />;
    //return (Platform.OS === 'ios') ? <TabViewPagerScroll {...props} /> :
    //  <TabViewPagerPan {...props}/>
  }

  render() {
    return (
      <TabViewAnimated
        style={{ flex: 1, width: screenWidth }}
        navigationState={this.state}
        renderScene={this._renderScene}
        renderHeader={this._renderHeader}
        onRequestChangeTab={this._handleChangeTab}
        renderPager={this._renderPager}
      />
    );
  }
}
