import React, { Component } from 'react';
import { View, ScrollView, ListView, Platform } from 'react-native';
import { optionStyle, container } from '../../styles/styles.js'
import Icon from 'react-native-vector-icons/Ionicons';
import { push, resetTo } from '../../actions/navigation.js';
import { save, clear } from '../../actions/drafts.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CheckBox from 'react-native-check-box'

const isAndroid = Platform.OS === 'android';

class SelectContactScene extends Component {
  constructor(props) {
    super(props);
    this.draftRef = this.props.draftRef;
    this.contacts = this.props.contacts;
    this.setDraftState = this.props.draftsAction.save.bind(this, this.draftRef);

    //render entry only if the entry changed
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        const {contacts} = this.props.drafts[this.draftRef].invites;
        if (r1.phoneNumbers && r1.phoneNumbers[0]) {
          const r1Num = r1.phoneNumbers[0].number;
          const r2Num = r2.phoneNumbers[0].number;
          return contacts[r1Num] !== contacts[r2Num];
        }
      }
    });

    this.state = {
      contacts: dataSource.cloneWithRows(this.props.contacts)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.drafts[this.draftRef].invites.contacts !== this.props.drafts[this.draftRef].invites.contacts;
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      contacts: this.state.contacts.cloneWithRows(this.props.contacts)
    })
  }

  _onChecked(contact) {
    const {invites} = this.props.drafts[this.draftRef];
    const phone = contact.phoneNumbers[0];
    let invitesCopy = Object.assign({}, invites);

    if (invites.contacts[phone.number]) {
      delete invitesCopy.contacts[phone.number];
    } else {
      invitesCopy.contacts[phone.number] = {
        name: contact.givenName + ' ' + contact.familyName,
        thumbnail: contact.thumbnailPath,
        phoneNumber: phone
      };
    }
    this.setDraftState({invites: invitesCopy});
  }


  _renderRow(contact, index) {
    const {contacts} = this.props.drafts[this.draftRef].invites;
    const phoneNumber = contact.phoneNumbers && contact.phoneNumbers[0] && contact.phoneNumbers[0].number;
    if (!phoneNumber) { return }
    const name = (contact.familyName) ? contact.familyName + ', ' + contact.givenName : contact.givenName;
    return (
      <View style={optionStyle.entry} key={name + index}>
        <CheckBox
          style={{flex: 1, padding: 10}}
          onClick={() => this._onChecked(contact)}
          isChecked={!!contacts[phoneNumber]}
          leftText={name + ':  ' + phoneNumber}
        />
      </View>
    );
  }

  render() {
    return <ScrollView keyboardDismissMode={isAndroid ? "none" : "on-drag"} contentContainerStyle={{flex:0, backgroundColor:'white'}}>
      {this.contacts.map((contact, index) => this._renderRow(contact, index))}
    </ScrollView>
  }
};

const mapStateToProps = (state) => {
  return {
    drafts: state.drafts.drafts,
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigation: bindActionCreators({ push, resetTo }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectContactScene);
