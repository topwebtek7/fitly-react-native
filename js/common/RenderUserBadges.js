import React, {Component} from 'react';
import { feedEntryStyle } from '../styles/styles.js';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';

export default class RenderUserBadges extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    }
    this.database = this.props.FitlyFirebase.database();
    this.displayName = this.props.displayName;
    this.uID = this.props.uID;
    this.containerStyle = this.props.containerStyle || {};
    this.displayNameOnly = this.props.displayNameOnly || false;

  }

  shouldComponentUpdate(nextProps) {
    return nextProps.userIDs.length === this.props.userIDs.length;
  }

  componentDidMount() {
    this._getData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._getData(nextProps);
  }

  _getData(props) {
    props.userIDs.map((userID, index) => {
      this.database.ref('users/' + userID + '/public').once('value')
      .then(userSnap => {
        const userObj = userSnap.val();
        let usersState = this.state.users.slice();
        usersState[index] = {
          name: userObj.first_name + ' ' + userObj.last_name,
          picture: userObj.picture,
          uid: userID,
        };
        this.setState({users: usersState})
      })
    })
  }

  _goToProfile(id) {
    if (id === this.uID) {
      return;
      this.props.pushToRoute("Profile")
    } else {
      this.props.pushToRoute("ProfileEntry", {
        otherUID: id
      })
    }
  }

  render() {
    const displayName = (this.displayName === undefined) ? true : this.displayName;
    return (this.displayNameOnly)
      ? (<View style={[this.containerStyle]}>
          {this.state.users.map((user, index) => {
            if (!user) {return null}
            return <Text style={this.props.labelStyle || {}} key={index + user.uid}>{user.name}</Text>;
          })}
        </View>)
      : (<ScrollView horizontal={true} contentContainerStyle={{justifyContent:'center', marginTop: 15, marginBottom: 15, alignSelf:'stretch'}}>
        {this.state.users.map((user, index) => {
          if (!user) {return null}
          return (
            <TouchableOpacity key={index + user.uid} style={{alignItems:'center', margin: 5}} onPress={() => this._goToProfile(user.uid)}>
              <Image source={(user.picture) ? {uri:user.picture} : require('../../img/default-user-image.png')}
              style={feedEntryStyle.defaultImg} defaultSource={require('../../img/default-user-image.png')}/>
              {(displayName) ? <Text style={[this.props.textStyle]}>{user.name}</Text> : null}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    );
  }
}
