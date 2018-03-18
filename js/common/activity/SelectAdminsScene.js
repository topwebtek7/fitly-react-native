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

const isAndroid = Platform.OS === 'android'

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
      invitedAdmins: this.draft.otherOrganizers || [],
      adminDetails: this.draft.adminDetails || {},
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

    const icon = (boolean) ? 'ios-remove-outline' : 'ios-add-outline';
    const adminLength = this.state.invitedAdmins.length;
    return (
      <View>
        {(!adminLength)
          ?
          <View style={[optionStyle.entry, {minHeight: 40, justifyContent: 'center'}]}>
              <Text style={{textAlign: 'center', color: 'grey'}}>empty</Text>
          </View>
          : null
        }

        {Object.keys(this.state.adminDetails).map((admin, i)=>{
          let {userID} = this.state.adminDetails[admin]
          return (
            <Entry
              key={i+admin}
              text={admin}
              icon={icon}
              onPress={() => this._uninviteAdmin(admin, userID)}/>
          )
        })}
      </View>
    )
  }

  _onPressUserInvite(userID, name, pic, account) {
    const {otherOrganizers} = this.props.drafts[this.draftRef];
    let adminCopy = Array.from(otherOrganizers);
    adminCopy.push(userID);

    let updatedAdmins = Object.assign({}, this.state.adminDetails);
    if(!updatedAdmins[name]){
      updatedAdmins[name] = {userID: userID, userPic: pic, account: account};
    } else {
      delete updatedAdmins[name]
    }

    this.setDraftState({otherOrganizers: adminCopy, adminDetails: updatedAdmins});

    this.setState({
      invitedAdmins: adminCopy,
      adminDetails: updatedAdmins,
    }, this.updateAdminInvite(userID))
  }

  _uninviteAdmin(name, userID){
    const {otherOrganizers} = this.props.drafts[this.draftRef];
    let adminCopy = Array.from(otherOrganizers);
    let i = adminCopy.indexOf(userID);
    adminCopy = [...adminCopy.slice(0,i), ...adminCopy.slice(i+1)]
    let updatedAdmins = Object.assign({}, this.state.adminDetails);
    delete updatedAdmins[name]
    this.setDraftState({otherOrganizers: adminCopy, adminDetails: updatedAdmins});


    this.setState({
      invitedAdmins: adminCopy,
      adminDetails: updatedAdmins,
    }, this.updateAdminInvite(userID))
  }

  updateAdminInvite(userID){
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
        let invited = {value: this.state.invitedAdmins[u._id]}
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

  render() {
    return (
      <View style={{flex: 1}}>
        {this.props.navigation.state.params.renderHeader('select organizers')}
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
          <UserListView
            {...this.props}
            userSearch={true}
            data={this.state.searchResults}
            noHeader={true}
            onPress={this._onPressUserInvite.bind(this)}
            includes={this.state.adminDetails}/>
          :
          <View style={{flex: 0}}>
            <Separator text='invited'/>
            {this._renderEntries(true)}
          </View>}
      </ScrollView>
    </View>)
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
