import React, { Component } from 'react';
import { View, Text, Alert } from 'react-native';
import HeaderInView from '../../header/HeaderInView.js';
import { Entry, Separator } from '../PressableEntry.js'

class EventOptionsMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventStatus: null,
    }
    // this.props.uID;
    // this.props.eventID;
    // this.props.navigation.state.params.FitlyFirebase;
    // this.props.navigateBack;
  }

  componentDidMount() {
    this.props.navigation.state.params.FitlyFirebase.database().ref('events/' + this.props.eventID + '/status').on('value', eventStatusSnap => {
      this.setState({eventStatus: eventStatusSnap.val()})
    })
  }

  componentWillUnmount() {
    this.props.navigation.state.params.FitlyFirebase.database().ref('events/' + this.props.eventID + '/status').off('value')
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{icon: "ios-arrow-round-back-outline"}}
        title='Event Options'
        _onPressLeft={this.props.navigation.goBack}
      />
    );
  };

  _onPress() {
    let text, status;
    if (this.state.eventStatus === 'normal') {
      text = 'Cancel Event';
      status = 'canceled';
    } else {
      text = 'Reactivate Event';
      status = 'normal';
    }

    Alert.alert(
      'WARNING',
      'You are about to cancel the event',
      [
        {
          text: text,
          onPress: () => {this.props.navigation.state.params.FitlyFirebase.database().ref('events/' + this.props.eventID + '/status').set(status)},
          style: 'cancel'
        },
        {
          text: 'Abort',
          onPress: () => {return}
        },
      ]
    )
  }

  render() {
    return (
      <View>
        {this._renderHeader()}
        <Separator
          text={(this.state.eventStatus) ? 'Event is ' + (this.state.eventStatus) : ''}
        />
        <Entry
          text={(this.state.eventStatus === 'normal') ? 'Cancel Event' : 'Reactivate Event'}
          onPress={() => this._onPress()}
        />
      </View>
    )
   }
 };

 export default EventOptionsMenu;
