import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { activityTabStyle } from '../../styles/styles.js';
import { push } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Icon from 'react-native-vector-icons/Ionicons';
import RenderUserBadges from '../../common/RenderUserBadges.js';
import { getDateStringByFormat } from '../../library/convertTime.js';

class ActivitySearchResultEntry extends Component {
  constructor(props) {
    super(props);
    this.event = this.props.data._source;
    this.eventID = this.props.data._id;
    this._pushToEvent = this._pushToEvent.bind(this);
  }

  _pushToEvent() {
    const isAdmin = this.event.organizers && !!this.event.organizers[this.props.uID] || false;
    //this.props.navigation.navigate("EventScene", {
    //  eventID: this.eventID,
    //  isAdmin
    //})
    this.props.screenProps.rootNavigation.navigate('EventScene', {
      eventID: this.eventID,
      isAdmin
    });
    // oldNav: ({key: 'EventScene@' + this.eventID, passProps:{eventID: this.eventID, isAdmin: isAdmin}}, {general: true})
  }

  render() {
    const event = this.event;
    return (
      <TouchableOpacity style={activityTabStyle.eventEntry} onPress={this._pushToEvent}>
        <View style={{width: 75, marginLeft: 15, marginRight: 50, justifyContent: 'center'}}>
          <RenderUserBadges
            userIDs={Object.keys(event.organizers)}
            FitlyFirebase={this.props.FitlyFirebase}
            textStyle={{color: 'white'}}
            pushToRoute={this.pushToRoute}
            uID={this.props.uID}
            displayNameOnly={true}
            labelStyle={{color:'#999', fontSize: 12}}
          />
        <Text style={[activityTabStyle.eventEntryText, {marginTop: 18}]}>{getDateStringByFormat(new Date(event.startDate),  this.props.searchMode ? 'MMM Do h:mm a' : 'h:mm a')}</Text>
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={[activityTabStyle.eventEntryText, {color: 'black'}]}>{event.title}</Text>
          {(event.location.placeName === 'unamed')
            ? <Text style={activityTabStyle.eventEntryText}>{event.location.address.split(',').slice(0, 2).join(',').trim()}</Text>
            : <Text style={activityTabStyle.eventEntryText}>{event.location.placeName}</Text>
          }
          <Text style={activityTabStyle.eventEntryText}>{event.memberCount + ' going'}</Text>
        </View>
      </TouchableOpacity>
    );
  }
};

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    loading: state.app.loading,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySearchResultEntry);
