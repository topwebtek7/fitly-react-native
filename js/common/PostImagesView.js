import React, { Component } from 'react';
import { postStyle, feedEntryStyle } from '../styles/styles.js';
import {
  ScrollView,
  Image,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { pop, push } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveUpdateToDB } from '../library/firebaseHelpers.js';
import Firebase from 'firebase';
import Author from './Author.js';
import CommentsModal from './comment/CommentsModal.js';
import SocialBtns from './SocialBtns.js';
import TimeAgo from 'react-native-timeago';
import FitImage from '../library/FitImage.js';
import HeaderInView from '../header/HeaderInView';
import { NavigationActions } from 'react-navigation';
const isAndroid = Platform.OS === 'android';

class PostImagesView extends Component {
  constructor(props) {
    super(props);
    let x = {};
    x[this.props.navigation.state.params.selectedKey] = true;
    this.state = {
      photos: [],
      photoCommentModal: x
    };
    this.FitlyFirebase = this.props.FitlyFirebase;
    this.database = this.FitlyFirebase.database();
    this.uID = this.props.uID;
    this.user = this.props.user;
    this.photoRef = this.database.ref('photos/');
    this.leftMargin = { marginLeft: 15 };
    this.fromFeeds = this.props.navigation.state.params.fromFeeds; // If we come from feeds
  }

  componentDidMount() {
    this._getPhotos();
  }

  _getPhotos() {
    if (this.fromFeeds) {
      const photoSource = [];
      this.postRef = this.database
        .ref(`posts/${this.props.navigation.state.params.postId}`)
        .child('photos')
        .once('value', photoSnaps => {
          const photos = photoSnaps.val();
          if (Array.isArray(photos)) {
            photos.forEach(photo => {
              photoSource.push({ key: Object.keys(photo)[0] });
            });
          } else {
            const obj = { key: Object.keys(photos)[0] };
            photoSource.push(obj);
          }

          this._preparePhotos(photoSource);
        });
    } else {
      this._preparePhotos(this.props.navigation.state.params.photos);
    }
  }

  _preparePhotos = photoSource => {
    photoSource.forEach((photo, index) => {
      this.photoRef.child(photo.key).once('value', photoSnap => {
        const photoObj = photoSnap.val();
        if (!photoObj) {
          return;
        }
        photoObj.tags = Object.keys(photoObj.tags || {});
        photoObj.key = photo.key;
        const photosCopy = this.state.photos.slice();
        photosCopy[index] = photoObj;
        this.setState({
          photos: photosCopy
        });
      });
    });
  };

  _renderTags(tags) {
    return (
      <View style={[postStyle.tagsRow, this.leftMargin]}>
        {tags.map((tag, index) => (
          <Text style={postStyle.tags} key={`tag${index}`}>
            #{tag}
          </Text>
        ))}
      </View>
    );
  }

  _renderPhoto(photo, width, index) {
    const modalControl = boolean => () => {
      const photoCommentModal = Object.assign({}, this.state.photoCommentModal);
      photoCommentModal[photo.key] = boolean;
      this.setState({ photoCommentModal });
    };
    return (
      <View key={`images${index}`}>
        <CommentsModal
          screenProps={this.props.screenProps}
          navigation={this.props.navigation}
          modalVisible={
            photo.key == this.props.navigation.state.params.selectedKey
          }
          initialRoute={contentInfo}
          disableCommentOnStart
        />
      </View>
    );
  }

  _renderPhotos() {
    const { photos } = this.state;
    return (
      <View style={postStyle.postContainer}>
        {photos ? (
          <CommentsModal
            screenProps={this.props.screenProps}
            navigation={this.props.navigation}
            modalVisible={true}
            initialRoute={{
              contentID: this.props.navigation.state.params.selectedKey,
              contentType: 'photo',
              parentAuthor: photos.find(
                photo =>
                  photo.key == this.props.navigation.state.params.selectedKey
              )
            }}
          />
        ) : (
          <ActivityIndicator animating style={{ height: 80 }} size="large" />
        )}
      </View>
    );
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        title="Post View"
        _onPressLeft={() => {
          this.props.navigation.goBack();
        }}
      />
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this._renderHeader()}
        {this._renderPhotos()}
      </View>
    );
  }
}

PostImagesView.propTypes = {
  photos: React.PropTypes.array
};

const mapStateToProps = state => ({
  user: state.user.user,
  uID: state.auth.uID,
  FitlyFirebase: state.app.FitlyFirebase
});

const mapDispatchToProps = dispatch => ({
  exnavigation: bindActionCreators({ pop, push }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PostImagesView);
