import React, {Component} from 'react';
import { postStyle, feedEntryStyle, composeStyle, headerStyle } from '../styles/styles.js';
import { Image, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {NavigationActions} from 'react-navigation';

export default Author = (props) => {
  const {content = {}, navigation, screenProps, reversed, nonClickable, showName = true, uID} = props;

  const _goToProfile = (id) => {
    if (screenProps) {
      if (id === uID) {
        screenProps.tabNavigation.navigate("Profile");
      }
      else {
        const resetNavigationToSearchAction = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({routeName: screenProps.tabNavigation.state.key}),
            NavigationActions.navigate({routeName: "ProfileEntry", params: { otherUID: id }})
          ]
        })
        navigation.dispatch(resetNavigationToSearchAction)
      }
    }
    else {
      navigation.navigate("ProfileEntry", { otherUID: id })
    }
  };

  const Wrapper = (nonClickable) ? View : TouchableOpacity;
  const name = (showName)
    ? <Text style={feedEntryStyle.username}>{content.authorName || props.name}</Text>
    : null
  return (reversed)
    ? <Wrapper onPress={() => _goToProfile(content.author)} style={[feedEntryStyle.profileRow, props.style]}>
        {name}
        <Image source={(content.authorPicture || props.picture) ? {uri:content.authorPicture || props.picture } : require('../../img/default-user-image.png')}
        style={feedEntryStyle.defaultImg} defaultSource={require('../../img/default-user-image.png')}/>
      </Wrapper>
    : <Wrapper onPress={() => _goToProfile(content.author)} style={[feedEntryStyle.profileRow, props.style]}>
        <Image source={(content.authorPicture || props.picture) ? {uri:content.authorPicture || props.picture} : require('../../img/default-user-image.png')}
        style={feedEntryStyle.defaultImg} defaultSource={require('../../img/default-user-image.png')}/>
        {name}
      </Wrapper>
}

Author.propTypes = {
  content: React.PropTypes.object,
  pushRoute: React.PropTypes.func,
};
