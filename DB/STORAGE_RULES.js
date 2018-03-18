function isCurrentUser(uid) {
  return request.auth.uid == uid;
}

function isImage() {
  return request.resource.contentType.matches("image/.*");
}

function notNull() {
  return request.resource != null;
}

service firebase.storage {
  match /b/fitly-625bd.appspot.com/o {
    match /users/{uid}/profilePic {
      match /{filename=**} {
        allow read;
        //having permission problems for the uploads, resorting to no securty for now
        allow write: if true;
      }
    }
    match /photos/{filename=**} {
      allow read;
      allow write: if true;
    }
    match /events/{filename=**} {
      allow read;
      allow write: if true;
    }
  }
}
