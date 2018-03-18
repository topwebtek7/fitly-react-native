/**
 * @flow
 */

import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  Animated,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { tabStyle, FitlyBlue } from '../styles/styles.js';
import { push, selectTab } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RunningManIcon from '../common/RunningManIcon';

const deviceWidth = Dimensions.get('window').width;
const selectTabWidth = deviceWidth / 3;
const tabWidth = (deviceWidth - selectTabWidth) / 4 - 1;

class Tab extends Component {
  constructor(props) {
    super(props);
    const startSpring = this.props.index === this.props.tabs.index ? 2 : 1;
    const startWidth =
      this.props.index === this.props.tabs.index ? selectTabWidth : tabWidth;
    this.state = {
      spring: new Animated.Value(startSpring),
      width: new Animated.Value(startWidth),
      opacity: new Animated.Value(1)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.index === nextProps.tabs.index) {
      Animated.timing(this.state.width, {
        toValue: selectTabWidth,
        duration: 100
      }).start();
    } else {
      Animated.timing(this.state.width, {
        toValue: tabWidth,
        duration: 100
      }).start();
      Animated.timing(this.state.spring, {
        toValue: 1,
        duration: 100
      }).start();
    }
  }

  _onPressIn() {
    Animated.spring(this.state.spring, {
      toValue: 0.8,
      friction: 2
    }).start();
    Animated.timing(this.state.opacity, {
      toValue: 0.6
    }).start();
  }

  _onPressOut() {
    Animated.spring(this.state.spring, {
      toValue: 2,
      friction: 2
    }).start();
    Animated.timing(this.state.opacity, {
      toValue: 1
    }).start();
  }

  _leftArrow(index) {
    return this.props.tabs.index === index ? (
      this.props.tabs.index > 0 ? (
        <Icon name={'caret-left'} size={20} color={'white'} />
      ) : (
        <Icon name={'caret-left'} size={20} color={'transparent'} />
      )
    ) : null;
  }

  _rightArrow(index) {
    return this.props.tabs.index === index ? (
      this.props.tabs.index < 4 ? (
        <Icon name={'caret-right'} size={20} color={'white'} />
      ) : (
        <Icon name={'caret-right'} size={20} color={'transparent'} />
      )
    ) : null;
  }

  render() {
    let { index, tab } = this.props;
    let tabStyling = tabStyle.tab;
    let iconSize = 20;
    let color = 'white';
    if (this.props.tabs.index === index) {
      tabStyling = tabStyle.selectedTab;
      iconSize = 20;
    }
    let iconName;
    if (tab.key === 'Activity') {
      iconName = 'calendar';
    } else if (tab.key === 'Search') {
      iconName = 'search';
    } else if (tab.key === 'Profile') {
      iconName = 'user';
    } else if (tab.key === 'Notification') {
      iconName = 'bell-o';
    } else if (tab.key === 'Connect') {
      iconName = 'users';
    }
    return (
      <TouchableWithoutFeedback
        onPressIn={() => this._onPressIn()}
        onPressOut={() => this._onPressOut()}
        onPress={() => this.props.changeTab(index)}
      >
        <Animated.View
          style={[
            tabStyling,
            { width: this.state.width, opacity: this.state.opacity }
          ]}
          key={index}
        >
          {tab.key === 'Connect' ? (
            <Animated.View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {this._leftArrow(index)}
              <Animated.View
                style={{
                  marginHorizontal: 20,
                  transform: [{ scale: this.state.spring }],
                  backgroundColor: 'transparent'
                }}
              >
                <RunningManIcon iconSize={iconSize} color={color} />
              </Animated.View>
              {this._rightArrow(index)}
            </Animated.View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {this._leftArrow(index)}
              <Animated.View
                style={{
                  marginHorizontal: 20,
                  transform: [{ scale: this.state.spring }],
                  backgroundColor: 'transparent'
                }}
              >
                <Icon name={iconName} size={iconSize} color={color} />
              </Animated.View>
              {this._rightArrow(index)}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

class TabBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectAnim: new Animated.Value(1.5),
      unSelectAnim: new Animated.Value(0.75)
    };
  }

  _changeTab(index) {
    this.props.navigation.selectTab(index);
  }

  _leftArrow(index) {
    return this.props.tabs.index > 0 && this.props.tabs.index === index ? (
      <Icon name={'caret-left'} size={20} color={'white'} />
    ) : (
      <Icon name={'caret-left'} size={20} color={'transparent'} />
    );
  }

  _rightArrow(index) {
    return this.props.tabs.index < 4 && this.props.tabs.index === index ? (
      <Icon name={'caret-right'} size={20} color={'white'} />
    ) : (
      <Icon name={'caret-right'} size={20} color={'transparent'} />
    );
  }

  render() {
    const tabs = this.props.tabs.routes.map((tab, index) => {
      return (
        <Tab
          key={index}
          index={index}
          tab={tab}
          changeTab={this._changeTab.bind(this, index)}
          {...this.props}
        />
      );
    });
    return <View style={tabStyle.tabBar}>{tabs}</View>;
  }
}

const mapStateToProps = state => {
  return {
    tabs: state.navState.tabs
  };
};

const mapDispatchToProps = dispatch => {
  return {
    navigation: bindActionCreators({ push, selectTab }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabBar);
