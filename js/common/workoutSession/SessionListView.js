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
  Platform
} from 'react-native';
import { feedEntryStyle } from '../../styles/styles.js';
import { getSessionsByUID } from '../../actions/session.js';
import { getDateStringByFormat } from '../../library/convertTime';
import { push, pop } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import HeaderInView from '../../header/HeaderInView'

const isAndroid = Platform.OS === 'android';

const SessionEntry = ({session, onPress}) => {
  let textStyle = {fontSize: 13, marginTop: 10, color: 'black'};
  return (
    <TouchableOpacity style={{borderBottomWidth: .5, borderColor: '#bbb'}} onPress={() => onPress(session.id, session.partner)}>
      <View style={{margin: 20, flexDirection: 'row', alignItems: 'center'}}>
        <Image source={(session.partner.picture) ? {uri:session.partner.picture} : require('../../../img/default-user-image.png')}
          style={feedEntryStyle.defaultImg} defaultSource={require('../../../img/default-user-image.png')}/>
        <Text style={textStyle}>{session.partner.first_name + ' ' + session.partner.last_name}</Text>
        <Text style={[textStyle, {textAlign: 'right', position: 'absolute', right: 0}]}>last connected at {'\n' + getDateStringByFormat(new Date(session.timestamp), "ddd, MMM Do")}</Text>
      </View>
    </TouchableOpacity>
  )
}

class SessionListView extends Component {
  static propTypes: {
    uID: React.PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.onPress = this.onPress.bind(this);
  }

  componentDidMount() {
    this.props.action.getSessionsByUID(this.props.uID);
  }

  onPress(sessionID, partner) {
    this.props.screenProps.rootNavigation.navigate("SessionView", {
      sessionID,
      scheduled: true,
      partner: partner,
    })
  }

  _renderHeader = () => {
    const customStyles = {
      zIndex: 0,
    }
    return (
      <HeaderInView
        customStyles={isAndroid ? customStyles : []}
        leftElement={{ icon: 'ios-close' }}
        title={"Sessions"}
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this._renderHeader()}
        {(this.props.sessionList.length)
          ? this.props.sessionList.map(session => <SessionEntry session={session} key={session.id} onPress={this.onPress}/>)
          : <Text style={{textAlign: 'center', marginTop: 50, color: '#bbb'}}>no previous sessions are found</Text>
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    uID: state.auth.uID,
    sessionList: state.session.sessions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    action: bindActionCreators({ getSessionsByUID }, dispatch),
    exnavigation: bindActionCreators({ push, pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionListView);
