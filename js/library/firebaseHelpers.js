import Firebase from 'firebase';
import firebaseConfig from '../../credentials/firebaseConfig.js'
export const FitlyFirebase = Firebase.initializeApp(firebaseConfig);
import { getCurrentPlace } from './asyncGeolocation.js';
import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;

//https://github.com/wkh237/react-native-fetch-blob/issues/205
const OriginalXMLHttpRequest = window.XMLHttpRequest
const OriginalBlob = window.Blob

export const createUpdateObj = (ref: string, data) => {
  let updateObj = {};
  for (key in data) {
    updateObj[ref + '/' + key + '/'] = data[key];
  }
  return updateObj;
};

export const createDeepUpdateObj = (data, ref: string = '') => {
  let updateObj = {};
  function traverse(prefix, obj) {
    if (typeof obj !== 'object') {
      updateObj[prefix] = obj;
    } else if (obj !== undefined || obj !== null) {
      for (let key in obj) {
        traverse(prefix + '/' + key, obj[key]);
      }
    }
  }
  traverse(ref, data);
  return updateObj;
};

export const firebaseGetCurrentUser = () => {
  return new Promise(function(resolve, reject) {
    let observer = (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(user);
      }
    };
    let unsubscribe = FitlyFirebase.auth().onAuthStateChanged(observer);
  });
};

export const blockUser = (uID, oID) =>{
  let blockRef = FitlyFirebase.database().ref();
  let blocks = {};
  blocks['blocks/'+uID+'/'+oID] = true
  blocks['blocks/'+oID+'/'+uID] = true
  blocks['blocking/'+uID+'/'+oID] = true
  blockRef.update(blocks)
}

export const updateCurrentLocationInDB = (uid) => {
  return getCurrentPlace().then(place => {
    return {
      place: `${place.locality}, ${place.adminArea}`,
      coordinate: {
        lat: place.position.lat,
        lon: place.position.lng,
      },
      zip: place.postalCode
    };
  }).then(placeObj => {
    return FitlyFirebase.database().ref('users/' + uid + '/public/userCurrentLocation/').set(placeObj);
  }).catch(error => {
    console.log('updateCurrentLocationInDB error ', error)
  });
};

export const uploadPhoto = (location, uri, options, mime = 'application/octet-stream') => {
  if (uri === undefined) { return; }
  if (window.XMLHttpRequest !== RNFetchBlob.polyfill.XMLHttpRequest) {
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
  }

  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
    let uploadBlob = null
    location = (options && options.profile)
      ? location + 'profile.jpg'
      : location + randomString() + '.jpg';

    const imageRef = FitlyFirebase.storage().ref(location)

    fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        if (window.XMLHttpRequest === RNFetchBlob.polyfill.XMLHttpRequest) {
          window.XMLHttpRequest = OriginalXMLHttpRequest;
          window.Blob = OriginalBlob;
        }
        resolve(url)
      })
      .catch((error) => {
        if (window.XMLHttpRequest === RNFetchBlob.polyfill.XMLHttpRequest) {
          window.XMLHttpRequest = OriginalXMLHttpRequest;
          window.Blob = OriginalBlob;
        }
        reject(error)
    })
  })
}

//uploads the photos and return a list of firebase database paths
export const savePhotoToDB = (photos, authorInfo, contentlink) => {

  const {author, authorName, authorPicture} = authorInfo;
  //this is needed to upload to Firebase, but it tampers with XMLHttpRequest which fetch depends, see: https://github.com/wkh237/react-native-fetch-blob/issues/205
  //we need to set XMLHttpRequest back to the original XMLHttpRequest after upload is finish
  //this is a work around that should be avoid once someone comes up with a solution
  window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
  window.Blob = Blob;
  let linkPromises = photos.map(photo => Promise.resolve(uploadPhoto('/photos/' + contentlink + '/', photo.path)));

  return Promise.all(linkPromises).then(links => {
    return links.map((link, index) => {
      const photoTagsArray = photos[index].tags || [];
      const photoTags = photoTagsArray.reduce((tagObj, tag) => {
        tagObj[tag] = true;
        return tagObj;
      }, {});

      const photoObj = {
        link: link,
        replyCount: 0,
        likeCount: 0,
        shareCount: 0,
        saveCount: 0,
        replyCount: 0,
        description: photos[index].description || '',
        author: author,
        authorName: authorName,
        authorPicture: authorPicture,
        tags: photoTags,
        contentlink: contentlink,
        createdAt: Firebase.database.ServerValue.TIMESTAMP
      };

      const photoKey = FitlyFirebase.database().ref('photos').push().key;
      FitlyFirebase.database().ref(`userPhotos/${author}/${photoKey}`).set({link: link, timestamp: Firebase.database.ServerValue.TIMESTAMP})
      return Promise.resolve(
        FitlyFirebase.database().ref(`photos/${photoKey}`).set(photoObj)
        .then(snap => {
          return {key: photoKey, link: link};
        })
      );
    });
  }).then(refPromises => {
    return Promise.all(refPromises);
  }).then(photoRefs => {
    return photoRefs;
    //https://github.com/wkh237/react-native-fetch-blob/issues/205
    window.XMLHttpRequest = OriginalXMLHttpRequest;
    window.Blob = OriginalBlob;
  }).catch(err => {
    console.log('savePhotoToDB error', err);
    window.XMLHttpRequest = OriginalXMLHttpRequest;
    window.Blob = OriginalBlob;
  });
};

export const saveUpdateToDB = (update, uid, type = {minor: false}) => {
  if (type.minor) {
    FitlyFirebase.database().ref('/userUpdatesAll/' + uid).push(update);
  } else {
    FitlyFirebase.database().ref('userUpdatesMajor/' + uid).push(update);
    FitlyFirebase.database().ref('userUpdatesAll/' + uid).push(update);
  }
};

export const turnOnfeedService = (uid, options = {self: false}, initialCallback, subsequentCallback) => {
  let notificationSource = (options.self === true)
    ? FitlyFirebase.database().ref('feeds/' + uid)
    : FitlyFirebase.database().ref('userUpdatesAll/' + uid)

  const handleNewFeed = (feedEntry) => {
    let feedKey = {feedKey: feedEntry.key}
    let feedObject = Object.assign({}, feedEntry.val(), feedKey)
    let feedPictures = [];
    feedEntry.child('photos').forEach(photo => {
      let photoObj = photo.val();
      photoObj.key = photo.key;
      feedPictures.push(photoObj);
    });
    feedObject.photos = feedPictures;
    subsequentCallback(feedObject);
  };

  notificationSource.orderByChild('timestamp').limitToLast(10).once('value')
  .then(feeds => {
    //the forEach below belongs to Firebase API not native JS, firebase data come back as objects,
    //which needs to be converted back to array for order iteration, firebase forEach can iterate firebase data in the correct order
    let feedsArray = [];
    feeds.forEach(feed => {
      let feedKey = {feedKey: feed.key}
      let feedObject = Object.assign({}, feed.val(), feedKey)
      let feedPictures = [];
      feed.child('photos').forEach(photo => {
        let photoObj = photo.val();
        photoObj.key = photo.key;
        feedPictures.push(photoObj);
      });
      feedObject.photos = feedPictures;
      feedsArray.push(feedObject);
    });
    initialCallback(feedsArray);
  }).catch(error => console.log(error));

  notificationSource.orderByChild('timestamp').startAt(Date.now()).on('child_added', handleNewFeed);
};

export const turnOffeedService = (uid, options) => {
  let notificationSource = (options.self === true)
    ? FitlyFirebase.database().ref('feeds/' + uid)
    : FitlyFirebase.database().ref('userUpdatesAll/' + uid);
  notificationSource.off('child_added');
};

export const turnOnCommentListener = (dbRef, initialCallback, subsequentCallback) => {
  dbRef.orderByChild('timestamp').once('value')
  .then(replies => {
    const commentMsgKeys = Object.keys(replies.val() || {});
    initialCallback(commentMsgKeys);
  }).catch(error => console.log(error));

  const handleNewComment = (commentEntry) => {
    let commentMsgKey = commentEntry.key;
    subsequentCallback(commentMsgKey);
  };

  dbRef.orderByChild('timestamp').startAt(Date.now()).on('child_added', handleNewComment);
}

export const turnOffCommentListener = (dbRef) => {
  dbRef.off('child_added');
}

export const convertFBObjToArray = (collectionObj) => {
  let array = [];
  collectionObj.forEach(item => {
    let itemObj = item.val();
    itemObj.key = item.key;
    array.push(itemObj);
  })
  return array;
};

export const createContentListener = (dbRef, callback) => {
  return function() {
    const handleUpdates = (snap) => {
      let snapObj = snap.val();
      if (snapObj === null) {
        //oddity, if snapObj is null and pass to the callback, it will always throw 'Cannot convert undefined or null to object' error, it is extremely annoying
        callback({});
        return;
      } else {
        if (snapObj.photos) { snapObj.photos = convertFBObjToArray(snap.child('photos')); }
        if (snapObj.tags) { snapObj.tags = Object.keys(snapObj.tags || {}); }
        if (snapObj.organizers) { snapObj.organizersArray = Object.keys(snapObj.organizers || {});}
        callback(snapObj);
      }
    };
    dbRef.on('value', handleUpdates);
  };
};

export const turnOffContentListner = (dbRef) => {
  dbRef.off('value');
};

//generate random id for photos
export const randomString = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


export const saveTags = (tags = [], contentID, type) => {
  const tagObj = tags.reduce((obj, tag)=>{
    let countRef = FitlyFirebase.database().ref('tags/'+tag.toLowerCase()+'/count');
    countRef.transaction((currentCount)=>{
      return (currentCount || 0) + 1;
    })
    const contentObj = {};
    contentObj['type'] = type;
    contentObj['timestamp'] = Date.now()
    obj['tags/' + tag.toLowerCase() + '/items/' + contentID] = contentObj;
    return obj
  }, {})
  FitlyFirebase.database().ref().update(tagObj);
}
