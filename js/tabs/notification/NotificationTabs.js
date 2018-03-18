import React, { Component } from 'react';
import { Text, Dimensions, View, ScrollView } from 'react-native';
import { TabViewAnimated, TabBarTop } from 'react-native-tab-view';
// import Feeds from './Feeds.js';
// import PhotoFeeds from './PhotoFeeds.js';

import { profileStyle } from '../../styles/styles.js';

import NotifFollowing from './NotifFollowing';
import NotifYou from './NotifYou';

let screenWidth = Dimensions.get('window').width;


export default class NotificationTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: '1', title: 'FOLLOWING' },
        { key: '2', title: 'YOU' },
      ],
      loaded: false,
    };
  };

  _handleChangeTab = (index) => {
    this.setState({ index });
  };

  _renderHeader = (props) => {
    const indicatorWidth = 65;
    let marginleft = screenWidth / 4 - indicatorWidth / 2;
    return <TabBarTop
             {...props}
             style={{backgroundColor: 'white'}}
             labelStyle={{fontSize: 12, color: "grey"}}
             indicatorStyle={{
               backgroundColor: '#326fd1', alignSelf: 'center', marginLeft: marginleft, width: indicatorWidth
             }}
           />;
  };

  _renderScene = ({ route }) => {
    switch (route.key) {
    case '1':
      return <ScrollView
                style={{flex:1, backgroundColor: 'white'}}
                contentContainerStyle={profileStyle.container}>

                <NotifFollowing
                  notifs={this.props.notifsF}
                  openProfile={this.props.openProfile}
                  openPost={this.props.openPost}
                  profilePics={this.props.profilePics}
                  profileAccounts={this.props.profileAccounts}
                  fetched={this.props.fetched.f}/>

              </ScrollView>
    case '2':
      return <ScrollView
                style={{flex:1, backgroundColor: 'white'}}
                contentContainerStyle={profileStyle.container}>

                <NotifYou
                  notifs={this.props.notifsY}
                  openProfile={this.props.openProfile}
                  openPost={this.props.openPost}
                  profilePics={this.props.profilePics}
                  profileAccounts={this.props.profileAccounts}
                  fetched={this.props.fetched.y}
                  FitlyFirebase={this.props.FitlyFirebase}
                  toggleFollow={this.props.toggleFollow}/>

              </ScrollView>
    default:
      return null;
    }
  };

  render() {
    return (
      <TabViewAnimated
        style={{flex: 1}}
        navigationState={this.state}
        renderScene={this._renderScene}
        renderHeader={this._renderHeader}
        onRequestChangeTab={this._handleChangeTab}
      />
    );
  }
}
