import React, { Component } from 'react';
import { composeStyle, headerStyle } from '../../styles/styles.js';
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
  Alert,
  Platform
} from 'react-native';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import HeaderInView from '../../header/HeaderInView.js';
import TagInput from 'react-native-tag-input';
import ImageEditModal from './ImageEditModal.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { pop, push, resetTo } from '../../actions/navigation.js';
import { save, clear } from '../../actions/drafts.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  savePhotoToDB,
  saveUpdateToDB,
  saveTags
} from '../../library/firebaseHelpers.js';
import {
  getImageFromCam,
  getImageFromLib
} from '../../library/pictureHelper.js';
import Firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';

const isAndroid = Platform.OS === 'android';
import { randomString } from '../../library/firebaseHelpers';
import { NavigationActions } from 'react-navigation';

// TODO: input validation??
const hashTagRegex = /^\w+$/g;

class ComposePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
      contentType: 'light-content'
    };
    this.draftsAction = this.props.draftsAction;
    this.setDraftState = this.props.draftsAction.save.bind(
      this,
      this.props.navigation.state.params.draftRef
    );
    this.clearState = this.props.draftsAction.clear.bind(
      this,
      this.props.navigation.state.params.draftRef
    );
    this.user = this.props.user;
    this.uID = this.props.uID;
    this.FitlyFirebase = this.props.FitlyFirebase;
  }

  // TODO: when hit summit does the view redirects to the post display view directly?
  // disables cliking send
  _savePostToDB() {
    // tables to update: posts, userPosts, userUpdatesMajor, userUpdatesAll
    (async () => {
      try {
        const draftState = this.props.drafts[
          this.props.navigation.state.params.draftRef
        ];
        if (
          !draftState.photos.length ||
          (!draftState.title && !draftState.content)
        ) {
          this.setState(
            {
              loading: false
            },
            () => {
              Alert.alert(
                'Information Missing\nPlease fill out at least the title and content or add a picture'
              );
            }
          );
          return;
        }
        this.setState({ loading: true });
        const postKey = this.FitlyFirebase.database()
          .ref()
          .child('posts')
          .push().key;
        const authorInfo = {
          author: this.uID,
          authorName: `${this.user.public.first_name} ${
            this.user.public.last_name
          }`,
          authorPicture: this.user.public.picture
        };
        let notifImage;
        const photoRefs = await savePhotoToDB(
          draftState.photos,
          authorInfo,
          `/posts/${postKey}`
        );
        const photoRefObject = photoRefs.reduce((refObj, photoRef) => {
          if (!notifImage) notifImage = photoRef.link;
          refObj[photoRef.key] = {
            link: photoRef.link,
            timestamp: Firebase.database.ServerValue.TIMESTAMP
          };
          return refObj;
        }, {});
        const tagsArray = draftState.tags || [];
        const tagObj = tagsArray.reduce((tags, tag) => {
          tags[tag] = true;
          return tags;
        }, {});
        if (draftState.tags.length) saveTags(draftState.tags, postKey, 'post');
        const postObj = {
          author: this.uID,
          authorName: `${this.user.public.first_name} ${
            this.user.public.last_name
          }`,
          authorPicture: this.user.public.picture,
          title: draftState.title,
          content: draftState.content,
          category: draftState.category,
          shareCount: 0,
          saveCount: 0,
          replyCount: 0,
          tags: tagObj,
          likeCount: 0,
          createdAt: Firebase.database.ServerValue.TIMESTAMP,
          photos: photoRefObject
        };

        this.FitlyFirebase.database()
          .ref(`/posts/${postKey}`)
          .set(postObj)
          .then(post => {
            this.FitlyFirebase.database()
              .ref(`/userPosts/${this.uID}/${postKey}`)
              .set({ timestamp: Firebase.database.ServerValue.TIMESTAMP });
            const updateObj = {
              type: 'post',
              contentID: postKey,
              contentlink: `/posts/${postKey}`,
              ownerID: this.uID,
              ownerName: `${this.user.public.first_name} ${
                this.user.public.last_name
              }`,
              ownerPicture: this.user.public.picture,
              contentTitle: draftState.title,
              photos: photoRefObject,
              contentSnipet: draftState.content.slice(0, 200),
              description: draftState.category.toLowerCase(),
              timestamp: Firebase.database.ServerValue.TIMESTAMP,
              notifImage
            };

            saveUpdateToDB(updateObj, this.uID);
            this.setState({ loading: false }, () => {
              this.props.navigation.goBack();
            });
          });
      } catch (error) {
        this.setState({ loading: false });
        console.log('create post error', error);
      }
    })();
  }

  _checkIncomplete(draftState) {
    let error;
    if (!draftState.title.length) {
      error = 'missing title';
    } else if (!draftState.startDate.date) {
      error = 'missing startDate';
    } else if (!draftState.endDate.date) {
      error = 'missing endDate';
    } else if (!draftState.location.address) {
      error = 'missing address';
    } else {
      return true;
    }
    Alert.alert('information missing', error);
    return false;
  }

  _getImageFromCam() {
    const draftState = this.props.drafts[
      this.props.navigation.state.params.draftRef
    ];
    getImageFromCam(image => {
      const newPhotos = draftState.photos;
      newPhotos.push(image);
      this.setDraftState({ photos: newPhotos });
    });
  }

  _getImageFromLib() {
    const draftState = this.props.drafts[
      this.props.navigation.state.params.draftRef
    ];
    getImageFromLib(images => {
      const newPhotos = draftState.photos.concat(images);
      this.setDraftState({ photos: newPhotos });
    });
  }

  _renderHeader() {
    const draftState = this.props.drafts[
      this.props.navigation.state.params.draftRef
    ];
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        rightElement={{ text: 'Publish' }}
        title={'Post'}
        _onPressRight={() => this._savePostToDB()}
        _onPressLeft={() => {
          this.props.navigation.goBack();
        }}
      />
    );
  }

  _renderThumbnails(photos) {
    return photos.map((photo, index) => (
      <TouchableOpacity
        key={index}
        onPress={() =>
          this.setState({ modalVisible: true, contentType: 'default' })
        }
        style={composeStyle.photoThumbnail}
      >
        <Image
          style={{ height: 100, width: 100 }}
          source={{ uri: photo.path, isStatic: true }}
        />
        <Icon
          style={{
            position: 'absolute',
            right: 10,
            bottom: 5,
            backgroundColor: 'rgba(0,0,0,0)'
          }}
          name="ios-expand"
          size={30}
          color="rgba(255,255,255,.7)"
        />
      </TouchableOpacity>
    ));
  }

  _renderImgModal(draftState) {
    const removeImg = index => {
      const newPhotos = draftState.photos.slice();
      newPhotos.splice(index, 1);
      this.setDraftState({ photos: newPhotos });
    };

    return (
      <ImageEditModal
        draftState={draftState}
        visible={this.state.modalVisible}
        onBack={() =>
          this.setState({ modalVisible: false, contentType: 'light-content' })
        }
        onRequestClose={() => this.setState({ modalVisible: false })}
        getImageFromLib={() => this._getImageFromLib()}
        getImageFromCam={() => this._getImageFromCam()}
        onRemoveImage={index => removeImg(index)}
        onCaptionChange={(text, index) => {
          const newPhotos = draftState.photos.slice();
          newPhotos[index].description = text;
          this.setDraftState({ photos: newPhotos });
        }}
        onTagChange={(tags, index) => {
          const newPhotos = draftState.photos.slice();
          newPhotos[index].tags = tags;
          this.setDraftState({ photos: newPhotos });
        }}
      />
    );
  }

  _renderPhotoSection(draftState, renderThumnails) {
    let thumbnails;
    if (renderThumnails) {
      thumbnails = this._renderThumbnails(draftState.photos);
    }
    return (
      <View style={composeStyle.photosSection}>
        {thumbnails}
        <TouchableOpacity
          style={composeStyle.photoThumbnail}
          onPress={() => this._getImageFromLib()}
        >
          <Icon name="ios-image-outline" size={30} color="#bbb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={composeStyle.photoThumbnail}
          onPress={() => this._getImageFromCam()}
        >
          <Icon name="ios-camera-outline" size={30} color="#bbb" />
        </TouchableOpacity>
      </View>
    );
  }

  _renderCategory() {
    return (
      <View style={composeStyle.input}>
        <Text style={{ fontSize: 16 }}>
          Category:{' '}
          {
            this.props.drafts[this.props.navigation.state.params.draftRef]
              .category
          }
        </Text>
      </View>
    );
  }

  render() {
    const draftState = this.props.drafts[
      this.props.navigation.state.params.draftRef
    ];
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle={this.state.contentType} />
        <Spinner
          visible={this.state.loading}
          textContent={'creating post...'}
          textStyle={{ color: '#FFF' }}
        />
        {this._renderImgModal(draftState)}
        {this._renderHeader()}
        <ScrollView
          keyboardDismissMode={isAndroid ? 'none' : 'on-drag'}
          contentContainerStyle={composeStyle.scrollContentContainer}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignSelf: 'stretch',
              alignItems: 'center'
            }}
          >
            <Image
              style={composeStyle[`${this.user.public.account}Img`]}
              source={
                this.user.public.picture
                  ? { uri: this.user.public.picture }
                  : require('../../../img/default-user-image.png')
              }
              defaultSource={require('../../../img/default-user-image.png')}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: 30,
                width: 200,
                paddingRight: 10
              }}
            >
              <Text
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  marginRight: 10,
                  fontWeight: '100',
                  textAlign: 'left',
                  color: 'black'
                }}
              >
                Category:{' '}
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  width: 100,
                  height: 20,
                  overflow: 'visible',
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'black',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
                onPress={() => {
                  this.props.screenProps.rootNavigation.navigate('MakePost', {
                    draftRef: this.props.navigation.state.params.draftRef
                  });
                }}
              >
                <Text>{draftState.category}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={composeStyle.inputBox}>
            <TextInput
              underlineColorAndroid={'transparent'}
              returnKeyType="done"
              maxLength={30}
              clearButtonMode="always"
              onChangeText={text => this.setDraftState({ title: text })}
              style={[composeStyle.input, { fontWeight: '300' }]}
              value={draftState.title}
              placeholder="Title"
              placeholderTextColor="grey"
            />
          </View>
          <View style={[composeStyle.inputBox, { paddingBottom: 20 }]}>
            <AutoExpandingTextInput
              clearButtonMode="always"
              onChangeText={text => this.setDraftState({ content: text })}
              style={[composeStyle.input, { fontSize: 16 }]}
              multiline
              value={draftState.content}
              placeholder="what's kicking?"
              placeholderTextColor="grey"
            />
            <View style={composeStyle.hashTagInput}>
              <Text style={composeStyle.hashTag}>#</Text>
              <TagInput
                value={draftState.tags}
                onChange={tags => this.setDraftState({ tags })}
                regex={hashTagRegex}
              />
            </View>
          </View>
          {this._renderPhotoSection(draftState, true)}
        </ScrollView>
      </View>
    );
  }
}

ComposePost.defaultProps = {
  draftRef: randomString()
};

const mapStateToProps = function(state) {
  return {
    drafts: state.drafts.drafts,
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop, push, resetTo }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ComposePost);
