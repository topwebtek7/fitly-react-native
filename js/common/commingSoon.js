import React, { Component } from 'react';
import {
  postStyle,
  feedEntryStyle,
  composeStyle,
  headerStyle,
  profileStyle
} from '../styles/styles';
import {
  Modal,
  View,
  TextInput,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  InteractionManager
} from 'react-native';
// import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { push, pop, resetTo } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  convertFBObjToArray,
  saveUpdateToDB,
  turnOnCommentListener,
  turnOffCommentListener,
  FitlyFirebase
} from '../library/firebaseHelpers.js';
import TimeAgo from 'react-native-timeago';
import Firebase from 'firebase';
import CommentsModal from './comment/CommentsModal.js';
import SocialBtns from './SocialBtns.js';
import Author from './Author.js';
import HeaderInView from '../header/HeaderInView.js';
import Spinner from 'react-native-loading-spinner-overlay';
import NewCommentIcon from './NewCommentIcon';

class PostView extends Component {
  componentWillMount() {
    console.log(
      this.props.user.private.email,
      this.props.user.public.userCurrentLocation,
      'Save the data here'
    );
    // this.props.FitlyFirebase.database()
    //   .ref()
    //   .child('trainerRequirements')
    //   .push({
    //     user: this.props.user.private.email,
    //     location: this.props.user.public.userCurrentLocation
    //   }); // when trying to save the data for analytics permission denied
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <HeaderInView
          leftElement={{ icon: 'ios-arrow-round-back-outline' }}
          rightElement={{ icon: 'ios-more' }}
          title="Post View"
          _onPressLeft={() => this.props.navigation.goBack()}
          _onPressRight={() => {}}
        />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: 'gray', fontSize: 22 }}>Coming Soon!</Text>
        </View>
      </View>
    );
  }
}

PostView.propTypes = {
  onPress: React.PropTypes.func
};

const mapStateToProps = state => ({
  user: state.user.user,
  uID: state.auth.uID,
  FitlyFirebase: state.app.FitlyFirebase
});

export default connect(mapStateToProps, null)(PostView);
