import React, { Component } from 'react';
import { View, InteractionManager } from 'react-native';


import PeopleSearch from '../common/PeopleSearch'


class ChatSearch extends Component{
  constructor(props){
    super(props);
  }

  _chooseContact(contact){
    this.props.navigation.goBack();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(
        'Chat',
        {
          chatID: null,
          contactID: contact.userID,
          profilePic: contact.picture,
          contact: contact.first_name+' '+contact.last_name,
          navigation: this.props.navigation
        }
      )
    });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <PeopleSearch
          {...this.props}
          onClick={this._chooseContact.bind(this)}
          />
      </View>
    );
  }
}

export default ChatSearch;
