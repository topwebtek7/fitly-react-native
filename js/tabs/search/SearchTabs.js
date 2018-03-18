import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { TabViewAnimated, TabBarTop } from 'react-native-tab-view';
let screenWidth = Dimensions.get('window').width;

import SearchResults from './SearchResults'
import TopResults from './TopResults'

export default class SearchTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: '0', title: 'Top' },
        { key: '1', title: 'Users' },
        { key: '2', title: 'Posts' },
        { key: '3', title: 'Events' },
        { key: '4', title: 'Tags' },
      ],
    };
  };

  componentWillUnmount() {
    console.log('unmounted');
  }

  _handleChangeTab = (index) => {
    this.setState({ index }, ()=>{
      this._getSearchResults();
    });
  };

  _getSearchResults(){
    let tab;
    switch (this.state.index) {
      case 0:
        tab = 'top'
        break;
      case 1:
        tab = 'users'
        break;
      case 2:
        tab='posts'
        break;
      case 3:
        tab = 'events'
        break;
      case 4:
        tab = 'tags'
        break;
      default:
        tab = null
    }
    this.props.activateTab(tab)
  }

  _renderHeader = (props) => {
    const indicatorWidth = 65;
    let marginleft = (screenWidth/5 - indicatorWidth)/2;
    return <TabBarTop {...props} style={{backgroundColor: 'white'}}
      labelStyle={{fontSize: 10, color: "grey"}}
      indicatorStyle={{backgroundColor: '#326fd1', width: indicatorWidth, marginLeft: marginleft}} />;
  };

  _renderScene = ({ route }) => {
    switch (route.key) {
    case '0':
      return(
        <TopResults
          {...this.props}
          searchResults={this.props.searchResults.top}
          searching={this.props.searchResults.searching}
          content={'top'}/>
      )
    case '1':
      return <SearchResults
                {...this.props}
                endReached={this.props.searchResults.users.endReached}
                searchResults={{users: this.props.searchResults.users.users}}
                searching={this.props.searchResults.searching}
                getMore={this.props.getMoreUsers}
                content={'users'} />;
    case '2':
      return <SearchResults
                {...this.props}
                endReached={this.props.searchResults.posts.endReached}
                searchResults={{posts: this.props.searchResults.posts.posts}}
                searching={this.props.searchResults.searching}
                getMore={this.props.getMorePosts}
                content={'posts'} />;
    case '3':
      return <SearchResults
                {...this.props}
                endReached={this.props.searchResults.events.endReached}
                searchResults={{events: this.props.searchResults.events.events}}
                searching={this.props.searchResults.searching}
                getMore={this.props.getMoreEvents}
                content={'events'} />;
    case '4':
      return <SearchResults
                {...this.props}
                endReached={true}
                searchResults={{tags: this.props.searchResults.tags.tags}}
                searching={this.props.searchResults.searching}
                getMore={()=>console.log()}
                content={'tags'} />;
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
