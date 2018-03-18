import React, { Component } from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  StatusBar,
  InteractionManager,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-datepicker';
import InviewLocationPicker from '../../common/InviewLocationPicker';
import SessionChat from './SessionChat';
import RNCalendarEvents from 'react-native-calendar-events';
import { optionStyle, datepickerStyle, FitlyBlue } from '../../styles/styles.js';
const FitlyBlueClear = 'rgba(29,47,123,.8)';
import {
  sessionListenerOn,
  sessionListenerOff,
  updateSession,
  confirmSession,
  cancelSession,
  sessionChatListenerOn,
  sessionChatListenerOff,
  sendMsg,
  clearSessionState,
} from '../../actions/session.js';
import { SessionService } from '../../services/SessionService.js';
import { getDateStringByFormat } from '../../library/convertTime.js';
import { pop } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HeaderInView from '../../header/HeaderInView';

import { NavigationActions } from 'react-navigation';

class SessionView extends Component {
  static propTypes: {
    scheduled: React.PropTypes.bool.isRequired,
    sessionID: React.PropTypes.string.isRequired,
    partner: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    console.log('SESSIONPROPS', this.props.navigation.state)
    this.session = new SessionService(this.props.navigation.state.params.sessionID);
    this.action = this.props.action;
    this.self = this.props.user.public;
    this.partner = this.props.navigation.state.params.partner;
    this.uID = this.props.uID;
    this._onPressBack = this._onPressBack.bind(this);
    this.updateSession = this.props.action.updateSession.bind(null, this.session);
    this.sendMsg = this.props.action.sendMsg.bind(null, this.session);
    this._onConfirmBtnPress = this._onConfirmBtnPress.bind(this);
    this.state = { addedToCalender: false }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.action.sessionListenerOn(this.session);
      this.action.sessionChatListenerOn(this.session);
    })
  }

  componentWillUnmount() {
    this.action.clearSessionState();
    this.action.sessionListenerOff(this.session);
    this.action.sessionChatListenerOff(this.session);
    clearTimeout(this.cancelPopTimer);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.session.canceled === 'partner') {
      const resetToProfile = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName:"TabNavigator"})]
      })
      this.cancelPopTimer = setTimeout(() => this.props.navigation.dispatch(resetToProfile), 1500);
    }

    if (!this.props.navigation.state.params.scheduled && !this.confirmed && nextProps.session.session.confirmation[this.uID] && nextProps.session.session.confirmation[this.partner.id]) {
      this.session.onConfirmed(this.uID, this.partner, this.props.session.session.startDate);
      this.confirmed = true;
    }
  }

  _onPressBack() {
    if (this.props.session.session) {
      const { confirmation } = this.props.session.session;
      if (confirmation[this.uID] && confirmation[this.partner.id]) {
        const resetToProfile = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({routeName:"TabNavigator"})]
        })
        this.props.navigation.dispatch(resetToProfile);
        return;
      }
    }
    Alert.alert(
      'Just to make sure',
      'You are about to cancel the session',
      [
        {text: 'Cancel Session', onPress: () => this._cancelSession()},
        {text: 'Back', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  _cancelSession() {
    const resetToProfile = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName:"TabNavigator"})]
    })

    this.action.cancelSession(this.session); //show alert
    this.props.navigation.dispatch(resetToProfile);
  }

  _onConfirmBtnPress() {
    const confirmedAll = this.props.session.session.confirmation[this.uID] && this.props.session.session.confirmation[this.partner.id];
    if (confirmedAll) {
      if (this.state.addedToCalender) {
        return;
      } else {
        RNCalendarEvents.authorizeEventStore()
        .then(status => {
          if (status === 'authorized') {
            console.log("----------------------------")

            console.log('SESSION', new Date(this.props.session.session.startDate).toISOString())

            console.log("----------------------------")
            return RNCalendarEvents.saveEvent('Workout with ' + this.partner.first_name + ' ' + this.partner.last_name, {
              location: this.props.session.session.location.address,
              startDate: new Date(this.props.session.session.startDate).toISOString(),
              endDate: new Date(this.props.session.session.startDate + 1000 * 60 * 60).toISOString()
            })
          }
        })
        .then(id => {
          this.setState({addedToCalender: true})
        })
        .catch(error => {
          console.log(error);
        });
      }
    } else {
      if (!this.props.session.session.startDate || !this.props.session.session.location) {
        let error;
        if (!this.props.session.session.startDate) {
          error = 'must set a date';
        } else if (!this.props.session.session.location) {
          error = 'must set a location';
        }
        Alert.alert('information missing', error);
      } else {
        this.updateSession({
          confirmation: {
            [this.uID]: !this.props.session.session.confirmation[this.props.uID]
          }
        })
      }
    }
  }

  _renderTopBtn() {
    let btnText = 'cancel';
    if (this.props.session.session) {
      const { confirmation } = this.props.session.session;
      if (confirmation && confirmation[this.uID] && confirmation[this.partner.id]) btnText = 'done';
    }
    return (
      <TouchableHighlight
        style={{flex: .03, marginTop: 30}}
        onPress={this._onPressBack}>
        <Text style={{color: 'black', fontSize: 15}}>{btnText}</Text>
      </TouchableHighlight>
    );
  }


  _renderSessionInfo() {
    const confirmedAll = this.props.session.session.confirmation[this.uID] && this.props.session.session.confirmation[this.partner.id];
    return (
      <View style={{flex: 1, alignSelf: 'stretch'}}>
        {this._renderProfileSection()}
        {this._renderConfirmBtn()}
        {this._renderDate()}
        {this._renderLocation()}
        <SessionChat
          navigation={this.props.navigation}
          messages={this.props.session.chatMsgs}
          onSend={this.sendMsg}
          user={{
            _id: this.uID,
            name: this.self.first_name + ' ' + this.self.last_name,
            avatar: this.self.picture
          }}
        />
      </View>
    )
  }

  _renderProfileSection() {
    return (
      <View style={{flex: .7, marginTop: 10, flexDirection: 'row'}}>
        {this._renderBadge(this.partner.picture, this.partner.first_name + ' ' + this.partner.last_name, this.partner.id)}
        {this._renderBadge(this.self.picture, 'You', this.uID)}
      </View>
    )
  }

  _renderBadge(picUrl, name, id) {
    const borderColor = (this.props.session.session.confirmation[id]) ? 'green' : 'red';
    const icon = (this.props.session.session.confirmation[id]) ? <Icon name="ios-checkmark" size={50} color="green"/> : null;
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <Image source={(picUrl) ? {uri:picUrl} : require('../../../img/default-user-image.png')}
          style={{width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: borderColor, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center'}}
          defaultSource={require('../../../img/default-user-image.png')}>
          {icon}
        </Image>
        <Text style={{fontSize: 13, margin: 5, color: 'black'}}>{name}</Text>
      </View>
    )
  }

  _renderConfirmBtn() {
    const confirmedAll = this.props.session.session.confirmation[this.uID] && this.props.session.session.confirmation[this.partner.id];
    let btnText = 'CONFIRM';
    let btnStyle = {flex: .3, left: 0, right: 0, backgroundColor: FitlyBlue, justifyContent: 'center', marginLeft: 50, marginRight: 50};
    if (this.props.session.session.confirmation[this.props.uID]) {
      btnText = 'CONFIRMED';
      unpressable = true;
      btnStyle = {...btnStyle, backgroundColor: 'green'}
    }
    if (confirmedAll) {
      if (this.state.addedToCalender) {
        btnText = 'event added on calender';
      } else {
        btnText = 'add session on calender';
      }
    };
    return (
      <TouchableOpacity style={btnStyle}
        onPress={this._onConfirmBtnPress}>
        <Text style={{color: 'white', textAlign: 'center', fontSize:20}}>{btnText}</Text>
      </TouchableOpacity>
    )
  }

  _renderDate() {
    const confirmedAll = this.props.session.session.confirmation[this.uID] && this.props.session.session.confirmation[this.partner.id];
    const { startDate = Date.now() } = this.props.session.session;
    return <View style={{padding: 5, height: 60, flexDirection: 'row', justifyContent: "center", alignItems:'center'}}>
      <DatePicker
        style={{flex: 1}}
        date={getDateStringByFormat(new Date(startDate), "ddd, MMM Do, h:mm A")}
        mode="datetime"
        format={"ddd, MMM Do, h:mm A"}
        placeholder="date"
        minDate={new Date()}
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        disabled={confirmedAll}
        onDateChange={(dateString, date) => {
          this.updateSession({
              confirmation: {
                [this.partner.id]: false,
              },
              startDate: date.getTime()
            })
          }
        }
        customStyles={datepickerStyle}
      />
    </View>
  }

  _renderLocation() {
    const confirmedAll = this.props.session.session.confirmation[this.uID] && this.props.session.session.confirmation[this.partner.id];
    return (
      <InviewLocationPicker
        location={this.props.session.session.location}
        updateLocation={(location) => this.updateSession({
          confirmation: {
            [this.partner.id]: false,
          },
          location
        })}
        style={{flex: 1.2, left: 0, right: 0}}
        mapStyle={{
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          position: 'absolute',
          borderWidth: .5,
        }}
        popupStyle={{ flex: 0, position: 'relative' }}
        disabled={confirmedAll}
      />
    )
  }

  _renderOnPartnerCanceled() {
    return <View style={{backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3, position:'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent:'center', alignItems:'center'}}>
      <Text style={{color: 'white', fontSize: 20, fontWeight:'600', textAlign: 'center'}}>{this.partner.first_name + ' ' + this.partner.last_name + '\n'}has canceled the session</Text>
    </View>
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar barStyle="dark-content"/>
        <KeyboardAvoidingView
          behavior={'position'}
          style={{flex: 1, backgroundColor: 'white'}}
          contentContainerStyle={{flex: 1, alignSelf: 'stretch', alignItems:'center'}}>
          {(this.props.session.canceled === 'partner') ? this._renderOnPartnerCanceled() : null}
          {this._renderTopBtn()}
          {(this.props.session.loading)
            ? <ActivityIndicator animating={this.props.session.loading} style={{height: 80}} size="large"/>
            : this._renderSessionInfo()
          }
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    uID: state.auth.uID,
    user: state.user.user,
    session: state.session,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    action: bindActionCreators({
      sessionListenerOn,
      sessionListenerOff,
      updateSession,
      confirmSession,
      cancelSession,
      sessionChatListenerOn,
      sessionChatListenerOff,
      sendMsg,
      clearSessionState
    }, dispatch),
    exnavigation: bindActionCreators({ pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionView);
