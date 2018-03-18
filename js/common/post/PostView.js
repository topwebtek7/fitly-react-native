import React, { Component } from 'react';
import {
  postStyle,
  feedEntryStyle,
  composeStyle,
  headerStyle,
  profileStyle
} from '../../styles/styles.js';
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
import { push, pop, resetTo } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  convertFBObjToArray,
  saveUpdateToDB,
  turnOnCommentListener,
  turnOffCommentListener
} from '../../library/firebaseHelpers.js';
import TimeAgo from 'react-native-timeago';
import Firebase from 'firebase';
import CommentsModal from '../comment/CommentsModal.js';
import SocialBtns from '../SocialBtns.js';
import Author from '../Author.js';
import HeaderInView from '../../header/HeaderInView.js';
import Spinner from 'react-native-loading-spinner-overlay';
import NewCommentIcon from '../NewCommentIcon';

class PostView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      commentLoading: true,
      modalVisible: true,
      menuOpen: false,
      author: {}
    };
    this.FitlyFirebase = this.props.FitlyFirebase;
    this.database = this.FitlyFirebase.database();
    this.uID = this.props.uID;
    this.user = this.props.user;
  }

  componentWillMount() {
    this.postRef = this.database.ref(
      `posts/${this.props.navigation.state.params.postID}`
    );
    InteractionManager.runAfterInteractions(() => {
      this._turnOnPostListener();
    });
  }
  _turnOnPostListener() {
    const handlePostUpdates = async postSnap => {
      const postObj = postSnap.val();
      if (!postObj) {
        return;
      }
      postObj.photos = await convertFBObjToArray(postSnap.child('photos'));
      postObj.tags = Object.keys(postObj.tags || {});
      this.setState({
        post: postObj
      });
      if (postObj.photos.length == 1) {
        // console.log('one photo navigate', this.setState);
        this.setState({ modalVisible: false });
        this.props.navigation.navigate('PostImagesView', {
          photos: postObj.photos,
          selectedKey: postObj.photos[0].key
        });
      }
      this.database
        .ref('users/' + postObj.author + '/public')
        .once('value')
        .then(data => {
          this.setState({ author: data.val() });
        });
      this.postRef.off('value');
    };
    this.postRef.on('value', handlePostUpdates);
  }

  _renderPost() {
    const initialRoute = {
      contentID: this.props.navigation.state.params.postID,
      contentType: 'post',
      parentAuthor: this.state.post.author
    };
    return (
      <View style={[postStyle.postContainer, { borderBottomWidth: 0 }]}>
        <CommentsModal
          navigation={this.props.navigation}
          screenProps={this.props.screenProps}
          modalVisible={this.state.modalVisible}
          openModal={() => this.setState({ modalVisible: true })}
          closeModal={() => this.setState({ modalVisible: false })}
          initialRoute={initialRoute}
        />
      </View>
    );
  }

  _openMenu() {
    this.setState({ menuOpen: !this.state.menuOpen });
  }

  _renderMenu() {
    return (
      <View
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          borderColor: '#aaa',
          borderWidth: 1,
          flex: 1,
          flexDirection: 'column',
          zIndex: 200,
          backgroundColor: '#fff',
          width: 100,
          padding: 10,
          shadowColor: 'black',
          shadowOpacity: 0.6,
          elevation: 2,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 2
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this._openMenu();
            this.props.screenProps.rootNavigation.navigate('ReportScene', {
              type: 'post',
              details: this.state.post,
              contentID: this.props.navigation.state.params.postID
            });
          }}
        >
          <Text>Report...</Text>
        </TouchableOpacity>
      </View>
    );
  }
  componentWillUpdate() {
    if (
      this.state.post &&
      this.state.post.photos.length == 1 &&
      this.state.modalVisible
    ) {
      this.setState({ modalVisible: false });
      this.props.navigation.navigate('PostImagesView', {
        photos: this.state.post.photos,
        selectedKey: this.state.post.photos[0].key
      });
    }
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <HeaderInView
          leftElement={{ icon: 'ios-arrow-round-back-outline' }}
          rightElement={{ icon: 'ios-more' }}
          title="Post View"
          _onPressLeft={() => this.props.navigation.goBack()}
          _onPressRight={this._openMenu.bind(this)}
        />

        <ScrollView
          style={{ backgroundColor: 'white' }}
          contentContainerStyle={postStyle.scrollContentContainer}
        >
          {this.state.menuOpen && this._renderMenu()}
          {this.state.post ? (
            this._renderPost()
          ) : (
            <Spinner
              visible={!this.state.post}
              //textContent={'loading post...'}
              textStyle={{ color: '#FFF' }}
            />
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }
}

PostView.propTypes = {
  postID: React.PropTypes.string
};

const mapStateToProps = state => ({
  user: state.user.user,
  uID: state.auth.uID,
  FitlyFirebase: state.app.FitlyFirebase
});

const mapDispatchToProps = dispatch => ({
  exnavigation: bindActionCreators({ push, pop, resetTo }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PostView);
