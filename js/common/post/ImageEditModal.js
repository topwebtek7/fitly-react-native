import React, {Component} from 'react';
import { composeStyle, headerStyle } from '../../styles/styles.js';
import { Modal, View, TextInput, Text, StatusBar, ScrollView, Image, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput.js';
import Icon from 'react-native-vector-icons/Ionicons';
import TagInput from 'react-native-tag-input';
const hashTagRegex = (/^\w+$/g);

const isAndroid = Platform.OS === 'android'

const ImageEditModal = (props) => {
    // this.props.visible;
    // this.props.onRequestClose;
    // this.props.getImageFromLib;
    // this.props.getImageFromCam;
    // this.props.onRemoveImage;
    // this.props.onCaptionChange;
    // this.props.onTagChange;
  const renderFullSizeImgs = (draftState) => {
    return draftState.photos.map((photo, index) => {
      return (
        <View key={index} style={composeStyle.imgLarge}>
          <TouchableOpacity style={composeStyle.closeBtn} onPress={() => props.onRemoveImage(index)}>
            <Icon name="ios-close-outline" size={50} color='rgba(255,255,255,.7)'/>
          </TouchableOpacity>
          <Image style={{width: null, height: 400}} source={{uri: photo.path, isStatic:true}}/>
          <AutoExpandingTextInput
            clearButtonMode="always"
            onChangeText={(text) => props.onCaptionChange(text, index)}
            style={[composeStyle.input, {fontSize: 16}]}
            multiline={true}
            value={(photo.description) ? photo.description : ''}
            placeholder="caption"
            placeholderTextColor="grey"
          />
          <View style={[composeStyle.hashTagInput, {borderWidth: 0}]}>
            <Text style={composeStyle.hashTag}>#</Text>
            <TagInput
              value={(photo.tags) ? photo.tags : []}
              onChange={(tags) => props.onTagChange(tags, index)}
              regex={hashTagRegex}
            />
          </View>
        </View>
      );
    });
  };

  return (
    <Modal
      animationType={"slide"}
      transparent={false}
      visible={props.visible}
      onRequestClose={props.onRequestClose}>
      <KeyboardAvoidingView behavior="position" style={{flex: 0}}>
        <Text style={{marginTop: 30, marginRight:20, marginBottom:15, fontSize: 20, alignSelf:'flex-end', color:'#1D2F7B'}} onPress={props.onBack}>back</Text>
        <ScrollView keyboardDismissMode={isAndroid ? "none" : "on-drag"} contentContainerStyle={{flex: 0}}>
          {renderFullSizeImgs(props.draftState)}
          <View style={[composeStyle.photosSection, {paddingTop: 15, paddingBottom: 15}]}>
            <TouchableOpacity style={composeStyle.photoThumbnail} onPress={props.getImageFromLib}>
              <Icon name="ios-image-outline" size={30} color="#bbb"/>
            </TouchableOpacity>
            <TouchableOpacity style={composeStyle.photoThumbnail} onPress={props.getImageFromCam}>
              <Icon name="ios-camera-outline" size={30} color="#bbb"/>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ImageEditModal;
