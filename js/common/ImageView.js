import React, { Component } from 'react';
import { postStyle, feedEntryStyle } from '../styles/styles.js';
import {
  ScrollView,
  Image,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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

class ImageView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photo: null,
      modalVisible: false
    };

    this.FitlyFirebase = this.props.FitlyFirebase;
    this.database = this.FitlyFirebase.database();
    this.uID = this.props.uID;
    this.user = this.props.user;
    this.photoRef = this.database.ref(
      'photos/' + this.props.navigation.state.params.photoID
    );
  }

  componentDidMount() {
    this._getPhoto();
  }

  _getPhoto() {
    this.photoRef.once('value', photoSnap => {
      let photoObj = photoSnap.val();
      if (!photoObj) {
        return;
      }
      photoObj.tags = Object.keys(photoObj.tags || {});
      this.setState({
        photo: photoObj
      });
    });
  }

  _renderTags(tags) {
    return (
      <View style={postStyle.tagsRow}>
        {tags.map((tag, index) => {
          return (
            <Text style={postStyle.tags} key={'tag' + index}>
              #{tag}
            </Text>
          );
        })}
      </View>
    );
  }

  _renderPhoto() {
    const { photo } = this.state;
    const contentInfo = {
      contentID: this.props.navigation.state.params.photoID,
      contentType: 'photo',
      parentAuthor: photo.author
    };
    const { width, height } = Dimensions.get('window');

    return (
      <View style={postStyle.postContainer}>
        <Text>YYYY</Text>
        <Author
          uID={this.props.uID}
          content={photo}
          style={{ marginLeft: 10 }}
          screenProps={this.props.screenProps}
          navigation={this.props.navigation}
        />
        <TimeAgo
          style={[feedEntryStyle.timestamp, { right: 15 }]}
          time={photo.createdAt}
        />
        <FitImage
          style={{ width: width }}
          resizeMode="cover"
          source={{ uri: photo.link }}
        />
        {photo.description ? (
          <Text style={postStyle.content}>{photo.description}</Text>
        ) : null}
        {this._renderTags(photo.tags)}
        <SocialBtns
          contentInfo={contentInfo}
          content={this.state.photo}
          buttons={{ comment: true, like: true, share: true, save: true }}
          onComment={() => this.setState({ modalVisible: true })}
        />
        <CommentsModal
          screenProps={this.props.screenProps}
          navigation={this.props.navigation}
          modalVisible={this.state.modalVisible}
          renderParent={() => this._renderPostBody()}
          openModal={() => this.setState({ modalVisible: true })}
          closeModal={() => this.setState({ modalVisible: false })}
          initialRoute={contentInfo}
        />
      </View>
    );
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        title="Image View"
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  render() {
    return (
      <View>
        {this._renderHeader()}
        <ScrollView
          style={{ backgroundColor: 'white' }}
          contentContainerStyle={postStyle.scrollContentContainer}
        >
          {this.state.photo ? (
            this._renderPhoto()
          ) : (
            <ActivityIndicator
              animating={this.state.postLoading}
              style={{ height: 80 }}
              size="large"
            />
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }
}

ImageView.propTypes = {
  photoID: React.PropTypes.string
};

const mapStateToProps = state => {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = dispatch => {
  return {
    exnavigation: bindActionCreators({ pop, push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageView);
