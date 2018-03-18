/**
 * @flow
 */

import React, { Component } from 'react';
import { Text, View, Alert } from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DatePicker from 'react-native-datepicker'
import { optionStyle, container } from '../../styles/styles.js'
import { save, clear } from '../../actions/drafts.js';
import { getDateStringByFormat } from '../../library/convertTime.js';
import HeaderInView from '../../header/HeaderInView.js';
import { pop, push, resetTo } from '../../actions/navigation.js';
import Firebase from 'firebase';
import Btn from '../Btn'

class SelectDateScene extends Component {
  constructor(props) {
    super(props);
    if (this.props.navigation.state.params.draftRef) {
      const draft = Object.assign({},this.props.drafts[this.props.navigation.state.params.draftRef])
      this.draftRef = this.props.navigation.state.params.draftRef;
      this.setDraftState = this.props.draftsAction.save.bind(this, this.draftRef);
      this.state = {
        startTime: draft.startDate,
        endTime: draft.endDate
      }
    } else {
      this.state = {
        startDate: {
          dateString: getDateStringByFormat(this.props.navigation.state.params.startDate, "ddd, MMM Do, h:mm A"),
          date: new Date(this.props.navigation.state.params.startDate),
        },
        endDate: {
          dateString: getDateStringByFormat(this.props.navigation.state.params.endDate, "ddd, MMM Do, h:mm A"),
          date: new Date(this.props.navigation.state.params.startDate),
        },
      }
      this.setDraftState = this.setState;
      this.eventRef = this.props.FitlyFirebase.database().ref('/events/' + this.props.navigation.state.params.eventID + '/');
      this._onPressChange = this._onPressChange.bind(this);
    }
  }

  _onPressChange() {
    Alert.alert(
      'WARNING',
      'You are about to change the event date',
      [
        {
          text: 'Change Date',
          onPress: () => {
            this.eventRef.child('startDate').set(this.state.startDate.date.getTime());
            this.eventRef.child('endDate').set(this.state.endDate.date.getTime());
            this.eventRef.child('updatedAt').set(Firebase.database.ServerValue.TIMESTAMP);
          },
          style: 'cancel'
        },
        {
          text: 'Cancel',
          onPress: () => {return}
        },
      ]
    )
  }

  _renderHeader() {
    return (this.props.navigation.state.params.draftRef)
     ? <HeaderInView
         leftElement={{icon: "ios-arrow-round-back-outline"}}
         title='Select Date'
         _onPressLeft={() => this.props.navigation.goBack()}
       />
     : <HeaderInView
         leftElement={{icon: "ios-arrow-round-back-outline"}}
         rightElement={{text: "change"}}
         title='Select New Date'
         _onPressRight={this._onPressChange}
         _onPressLeft={() => this.props.navigation.goBack()}
       />
  };

  _onPress(){
    if(this.state.startTime && this.state.endTime){
      this.props.navigation.goBack()
    } else {
      let error;
      if (!this.state.startTime) {
        error = 'Need to have a valid start time'
      } else {
        error = 'Need to have a valid end time'
      }
      Alert.alert('information missing', error);
    }
  }

  render() {
    let startDate, endDate;
    if (this.props.navigation.state.params.draftRef) {
      startDate = this.props.drafts[this.draftRef].startDate;
      endDate = this.props.drafts[this.draftRef].endDate;
    } else {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
    }
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 1, month, day)

    return (
      <View style={optionStyle.container}>
        {this._renderHeader()}
        <View style={optionStyle.entry}>
          <Text style={optionStyle.label}>Start Date</Text>
          <DatePicker
            style={optionStyle.datePicker}
            date={startDate && startDate.dateString}
            mode="datetime"
            format={"ddd, MMM Do, h:mm A"}
            placeholder="date"
            minDate={new Date()}
            maxDate={endDate && endDate.date || c}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            onDateChange={(dateString, date) =>{
              this.setDraftState({startDate: {dateString, date}})
              this.setState({startTime: true})
            }}
            customStyles={datepickerStyle}
          />
        </View>
        <View style={optionStyle.entry}>
          <Text style={optionStyle.label}>End Date</Text>
          <DatePicker
            style={optionStyle.datePicker}
            date={endDate && endDate.dateString}
            mode="datetime"
            format={"ddd, MMM Do, h:mm A"}
            placeholder="date"
            minDate={startDate && startDate.date || new Date()}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            onDateChange={(dateString, date) => {
              this.setDraftState({endDate: {dateString, date}})
              this.setState({endTime: true})
            }}
            customStyles={datepickerStyle}
          />
        </View>
        <Btn
          onPress={this._onPress.bind(this)}
          text={'Done'}/>
      </View>
    )
  }
 };

 const datepickerStyle = {
   dateIcon: {
     left: 0,
     marginLeft: 15
   },
   dateInput: {
     borderWidth: 0
   },
   dateText: {
     color: 'black',
     width: 200,
     textAlign: 'right',
     marginRight: 100,
     alignSelf: 'flex-start'
   },
   btnCancel: {

   },
   placeholderText: {
     color: 'black',
     alignSelf: 'flex-end'
   },
   btnTextConfirm: {
     color: '#007AFF'
   }
 }


 const mapStateToProps = function(state) {
  return {
    drafts: state.drafts.drafts,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({pop}, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectDateScene);
