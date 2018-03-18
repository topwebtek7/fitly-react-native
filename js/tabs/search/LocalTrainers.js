import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Image,
  Slider,
  ActivityIndicator,
  Platform,
  TouchableHighlight
} from 'react-native';
import UserSearchResults from './UserSearchResults.js';

const screenWidth = Dimensions.get('window').width;
const picSize = screenWidth / 3;

export default class LocalTrainers extends Component {
  render() {
    return (
      <TouchableOpacity
        style={{
          height: 70,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onPress={this.props.onPress}
      >
        <Text style={{ color: alternateBlue }}>Find a Trainer</Text>
      </TouchableOpacity>
    );
  }
}

const alternateBlue = '#326fd1';

const localPeople = StyleSheet.create({
  notif_container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    width: screenWidth - 30,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    position: 'relative'
  },
  left: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  profilePic: {
    // alignSelf: 'flex-start',
    borderRadius: 30,
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#FF0000',
    justifyContent: 'center',
    shadowColor: '#FF0000',
    shadowOpacity: 0.5,
    //elevation: 2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2
  },
  text: {
    marginLeft: 5,
    flex: 1,
    flexDirection: 'column'
  },
  kind: {
    width: 45,
    height: 45,
    marginLeft: 10,
    borderColor: 'black',
    borderWidth: 0.5
  },
  email_text: {
    fontSize: 18
  }
});
