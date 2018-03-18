import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { activityTabStyle, feedEntryStyle } from '../../styles/styles.js';
import { push } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Icon from 'react-native-vector-icons/Ionicons';
import RenderUserBadges from '../../common/RenderUserBadges.js';
import { getDateStringByFormat } from '../../library/convertTime.js';

class UserSearchResultEntry extends Component {
  constructor(props) {
    super(props);
    this._goToProfile = this._goToProfile.bind(this);
  }

  _goToProfile() {
    const id = this.props.data._id;
    if (id === this.props.uID) {
      this.props.navigation.navigate("Profile")
    } else {
      this.props.navigation.navigate("ProfileEntry", {
        otherUID: id
      })
    }
  }

  render() {
    const user = this.props.data._source;

    return (
      <TouchableOpacity style={activityTabStyle.eventEntry} onPress={this._goToProfile}>
        <View style={{margin: 15, flexDirection: 'row', justifyContent: 'center', alignItems:'center'}}>
          <Image source={(user.picture) ? {uri:user.picture} : require('../../../img/default-user-image.png')}
          style={feedEntryStyle.defaultImg} defaultSource={require('../../../img/default-user-image.png')}/>
          <Text style={[this.props.textStyle, {marginLeft: 15}]}>{user.first_name + ' ' + user.last_name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
};

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserSearchResultEntry);
