import ImagePicker from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Platform} from 'react-native';

const isAndroid = Platform.OS === 'android';


export const selectPicture = () => {
  const options = {
    title: 'Select a Profile Picture',
    mediaType: 'photo',
    noData: true,
    //maxWidth: 350,
    //maxHeight: 350,
    maxWidth: 700,
    maxHeight: 700,
  };

  if(!isAndroid) {
    options.cameraType = 'back';
  }

  return new Promise((resolve, reject) => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        reject(response.error);
      }
      resolve(response);
    });
  })
};

export const selectPictureCropper = () => {
  const options = {
    maxWidth: 350,
    maxHeight: 350,
    cropping: true,
  };
  return new Promise((resolve, reject) => {
    ImageCropPicker.openPicker(options)
    .then(image => {
      image.uri = image.path;
      resolve(image)
    })
    .catch(err => {
      console.log('image cropper', err);
      //reject(err);
    })
  })
}

export const getImageFromCam = (callback) => {
  ImageCropPicker.openCamera({
    compressImageQuality: .6
  }).then(images => {
    callback(images);
  }).catch(error => {
    console.log('image from cam', error);
  });
};

export const getImageFromLib = (callback) => {
  ImageCropPicker.openPicker({
    cropping: true,
    multiple: true,
    compressImageQuality: .6
  }).then(images => {
    callback(images);
  }).catch(error => {
    console.log('image from lib', error);
  });
};
