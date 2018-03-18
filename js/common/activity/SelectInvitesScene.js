import React, { Component } from 'react';
import { TouchableHighlight, Text, View, TouchableOpacity, ScrollView, InteractionManager, ActivityIndicator, Platform } from 'react-native';
import { optionStyle, container } from '../../styles/styles.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { push, resetTo } from '../../actions/navigation.js';
import { save, clear } from '../../actions/drafts.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SearchBar from 'react-native-search-box';
import Contacts from 'react-native-contacts';
import { Entry, Separator } from '../PressableEntry.js'
import Query from '../../library/Query';
import UserListView from '../UserListView'

const isAndroid = Platform.OS === 'android';

class SelectInvitesScene extends Component {
  constructor(props) {
    super(props);
    this.draftRef = this.props.navigation.state.params.draftRef;
    this.setDraftState = this.props.draftsAction.save.bind(this, this.draftRef);
    this.draft = this.props.drafts[this.props.navigation.state.params.draftRef];
    this.state = {
      loadingContacts: true,
      contacts: [],
      searchResults: [],
      searchMode: false,
      invitedUsers: this.draft.invites.users || {},
      userNames: this.draft.invites.names || {},
    }
    this.userQuery = new Query('user', this.props.uID);
    this.doneTypingInterval = 500;
    this.typingTimer;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      Contacts.getAll( (error, contacts) =>  {
        if (error && error.type === 'permissionDenied') {
          console.error(error);
        }
        else {
          this.setState({
            loadingContacts: false,
            contacts: contacts
          })
        }
      });
    });
  }

  _renderEntries(boolean) {
    const {allFollowings, allFollowers, allPrevConnected, facebookFriend, contacts, users} = this.props.drafts[this.draftRef].invites;
    const icon = (boolean) ? 'ios-remove-outline' : 'ios-add-outline';
    const contactLength = Object.keys(contacts).length;
    const showEmpty = boolean
      ? (allFollowings || allFollowers || allPrevConnected || !!contactLength) === boolean
      : (allFollowings && allFollowers && allPrevConnected && facebookFriend && !!contactLength) === boolean;
    const showContacts = (boolean)
      ? ((contactLength > 0) === boolean) ? <Entry text={'contacts: ' + contactLength + ' added'} icon={icon} onPress={() => this._clearInviteContacts()}/> : null
      : null;
    const facebookSection = (facebookFriend === boolean) ? <Entry text='all facebook friends' icon={icon} onPress={() => this._onPressQuickInvites('facebookFriend')}/> : null
    return (
      <View>
        {(showEmpty)
          ? null
          : <View style={[optionStyle.entry, {minHeight: 40, justifyContent: 'center'}]}>
              <Text style={{textAlign: 'center', color: 'grey'}}>empty</Text>
            </View>}
        {(allFollowings === boolean) ? <Entry text='all followings' icon={icon} onPress={() => this._onPressQuickInvites('allFollowings')}/> : null}
        {(allFollowers === boolean) ? <Entry text='all followers' icon={icon} onPress={() => this._onPressQuickInvites('allFollowers')}/> : null}
        {(allPrevConnected === boolean) ? <Entry text='all previously connected users' icon={icon} onPress={() => this._onPressQuickInvites('allPrevConnected')}/> : null}

        {showContacts}
        {Array.from(Object.keys(this.state.userNames)).map((name, i)=>{
          return <Entry key={i+name} text={name} icon={icon} onPress={() => this._onPressUserInvite(this.state.userNames[name], name)}/>
        })}
      </View>
    )
  }


  _onPressQuickInvites(key) {
    const {invites} = this.props.drafts[this.draftRef];
    let invitesCopy = Object.assign({}, invites);
    invitesCopy[key] = !invitesCopy[key];
    this.setDraftState({invites: invitesCopy});
  }

  _onPressUserInvite(userID, name) {
    const {invites} = this.props.drafts[this.draftRef];
    let invitesCopy = Object.assign({}, invites);
    invitesCopy.users[userID] = !invitesCopy.users[userID];
    let updatedNames = Object.assign({}, this.state.userNames);
    if(invitesCopy.users[userID]){
      updatedNames[name] = userID;
    } else {
      delete updatedNames[name]
    }
    invitesCopy.names = updatedNames
    this.setDraftState({invites: invitesCopy});
    this.setState({
      invitedUsers: invitesCopy.users,
      userNames: updatedNames,
    }, this.updateUserInvite(userID))
  }

  _clearInviteContacts() {
    const {invites} = this.props.drafts[this.draftRef];
    let invitesCopy = Object.assign({}, invites);
    invitesCopy.contacts = {};
    this.setDraftState({invites: invitesCopy});
  }

  updateUserInvite(userID){
    let updateResults = Array.from(this.state.searchResults).map(user=>{
      if (user.userID===userID) {
        let newValue = {value: !user.value};
        return Object.assign({}, user, newValue)
      } else {
        return user;
      }
    })
    this.setState({
      searchResults: updateResults
    })
  }

  _textChange(text){
    clearTimeout(this.typingTimer);
    this.setState({
      searchResults: [],
    })
    if (text.length) {
      this.typingTimer = setTimeout(()=>{
        this._getUserSearch(text);
      }, this.doneTypingInterval);
    } else {
      this.setState({searchResults: []})
    }
  }

  _getUserSearch(text){
    this.userQuery.searchByInput('full_name', text)
    .then(results => {
      let users = Array.from(results).map(u=>{
        let id = {userID: u._id}
        let invited = {value: this.state.invitedUsers[u._id]}
        return Object.assign({}, u._source, id, invited)
      })
      this.setState({
        searchResults: users
      })
    })
    .catch(error => {
      this.setState({
        searchResults: []
      })
    });
  }

  _contactHolds(){
    return (
      <View style={{flex: 0}}>
        <Separator text='invite contacts'/>
        <Entry
          text='contacts'

          onPress={() => {

            {/* oldNav:({
            key: 'SelectContactScene',
            showHeader: true,
            headerTitle: 'select contacts',
            leftHeaderIcon: 'ios-arrow-round-back-outline',
            global: true,
            passProps:{
              draftRef: this.draftRef,
              contacts: this.state.contacts
            } */}

            this.props.navigation.navigate("SelectContactScene", {
              draftRef: this.draftRef,
              contacts: this.state.contacts
            })
          }}
          icon='ios-add-outline'>
          {(this.state.loadingContacts) ? <ActivityIndicator animating={this.state.loadingContacts} size="small"/> : null}
        </Entry>
      </View>
    )
  }

  render() {
    return <View style={{flex: 1}}>
      {this.props.navigation.state.params.renderHeader('select invites')}
      <SearchBar
        ref='searchBar'
        placeholder='Search Users'
        showsCancelButton={true}
        onFocus={() => this.setState({searchMode: true})}
        onCancel={() => this.setState({searchMode: false})}
        onChangeText={this._textChange.bind(this)}
        backgroundColor={'grey'}
        />
    <ScrollView keyboardDismissMode={isAndroid ? "none" : "on-drag"} contentContainerStyle={{flex:1, backgroundColor:'white'}}>
      {this.state.searchMode ?
        this.state.searchResults.length ?
          <UserListView
            {...this.props}
            userSearch={true}
            data={this.state.searchResults}
            noHeader={true}
            onPress={this._onPressUserInvite.bind(this)}
            includes={this.state.invitedUsers}/>
          :
          <View></View>
        :
      <View>
        <View style={{flex: 0}}>
          <Separator text='invited'/>
          {this._renderEntries(true)}
        </View>
        <View style={{flex: 0}}>
          <Separator text='quick invites'/>
          {this._renderEntries(false)}
        </View>
      </View>}
    </ScrollView>
    </View>
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
    exnavigation: bindActionCreators({ push, resetTo }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectInvitesScene);
