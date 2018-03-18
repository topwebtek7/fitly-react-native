import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';


import Profile from '../tabs/profile/_Profile.js';
import Activity from '../tabs/activity/_Activity';
import Notification from '../tabs/notification/_Notification';
import Search from '../tabs/search/_Search';
import Connect from '../tabs/connect/_Connect';

const TabBarNavigation = TabNavigator({
  Activity: {screen: Activity},
  Search: {screen: Search},
  Profile: {screen: Profile},
  Notification: {screen: Notification},
  Connect: { screen: Connect }
}, {
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  animationEnabled: false,
  swipeEnabled: true,
  initialRouteName: "Profile",
  lazy: true,
  tabBarOptions: {
    showLabel: false,
    showIcon: true,
    activeBackgroundColor: '#1D2F7B',
    inactiveBackgroundColor: 'rgba(61,61,61,1)',
    indicatorStyle: null,

  },
  
});

class TabNavigationWrapper extends React.Component {


  render() {
    const {navigation} = this.props;

    return <TabBarNavigation screenProps={{rootNavigation: navigation}} />
  }
}


export default TabNavigationWrapper;
