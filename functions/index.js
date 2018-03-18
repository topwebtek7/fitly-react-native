// firebase function to go through ALL images and resize them they're too big
// to invoke: https://us-central1-fitly-625bd.cloudfunctions.net/checkSize

const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const mkdirp = require('mkdirp-promise');
const fs = require('fs');

const serviceAccount = require('./fitly-625bd-firebase-adminsdk-xidnb-298ce59b83.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fitly-625bd.firebaseio.com',
});

const BUCKET_NAME = 'fitly-625bd.appspot.com';
const IMAGE_EXTENSION = '.jpg';
const BYTES_IN_MB = 1048576;
const SIZE_ALLOWANCE_IN_MB = 0.4; // in MB
const NOT_EXISTING = 'not_exists';

function isSizeOverAllowance(size) {
  return size / BYTES_IN_MB > SIZE_ALLOWANCE_IN_MB;
}

function handleImageResizing(file) {
  if (!isSizeOverAllowance(file.size)) {
    console.log('No need for resize. Size: ', file.size / BYTES_IN_MB, ' MB.');
    return Promise.resolve(file);
  }
  console.log('Needs resizes! File size: ', file.size / BYTES_IN_MB, ' MB.');
  return resizeImage(file, file.bucket);
}

function resizeImage(file, bucket = BUCKET_NAME) {
  // ex: events/kitty.png
  const filePath = file.name;
  // ex: kitty
  const baseFileName = path.basename(filePath, path.extname(filePath));
  // ex: events/
  const dirName = path.dirname(filePath);
  // events/kitty.jpg
  const newFilePath = path.normalize(
    path.format({
      dir: dirName,
      name: baseFileName,
      ext: IMAGE_EXTENSION,
    })
  );

  const tempLocalFile = path.join(
    os.tmpdir(),
    path.dirname(filePath),
    `temp__${path.basename(filePath)}`
  );
  const tempNewFile = path.join(os.tmpdir(), newFilePath);
  const tempLocalDir = path.dirname(tempLocalFile);

  return mkdirp(tempLocalDir).then(() =>
    gcs
      .bucket(bucket)
      .file(filePath)
      .download({
        destination: tempLocalFile,
      })
      .then(() => Promise.resolve(true))
      .then(() =>
        sharp(tempLocalFile)
          .resize(500, 500)
          .min()
          .jpeg({
            quality: 90,
          })
          .toFile(tempNewFile)
          .then(() =>
            // console.log('Saved it to: ', tempNewFile);
            // console.log('Uploading to: ', newFilePath);
            Promise.resolve(true)
          )
          .then(() =>
            gcs
              .bucket(bucket)
              .upload(tempNewFile, {
                destination: newFilePath,
              })
              .then(() => {
                fs.unlinkSync(tempLocalFile);
                fs.unlinkSync(tempNewFile);
                console.log('Handled', filePath);
                return gcs
                  .bucket(bucket)
                  .file(filePath)
                  .getMetadata()
                  .then(meta => ({
                    name: meta.name,
                    size: meta.size,
                    selfLink: meta.selfLink,
                  }));
              })
          )
      )
  );
}

/* Undeployed functions 

exports.checkSize = functions.https.onRequest((req, res) =>
  gcs
    .bucket(BUCKET_NAME)
    .getFiles()
    .then(result => {
      const fileList = result[0].filter(fileData =>
        /\.(jpg|jpeg|png)/i.test(fileData.name)
      );
      return Promise.all(
        fileList.map(item =>
          gcs
            .bucket(BUCKET_NAME)
            .file(item.name)
            .getMetadata()
            .then(([fileMeta]) => ({
              name: fileMeta.name,
              bucket: fileMeta.bucket,
              ID: fileMeta.id,
              selfLink: fileMeta.selfLink,
              size: fileMeta.size,
            }))
            .then(handleImageResizing)
        )
      )
        .then(values => {
          res.json(JSON.parse(JSON.stringify(values)));
        })
        .catch();
    })
);

exports.handleImageUpload = functions.storage.object().onChange(event => {
  const object = event.data;
  const fileBucket = object.bucket;
  const filePath = object.name;
  const resourceState = object.resourceState;

  const fileName = path.dirname(filePath);

  if (resourceState === NOT_EXISTING) {
    console.log('Resource', fileName, 'No longer existing');
    return Promise.resolve(false);
  }

  const bucket = gcs.bucket(fileBucket);

  return bucket
    .file(filePath)
    .getMetadata()
    .then(([meta]) => {
      const fileMeta = {
        name: meta.name,
        size: meta.size,
        bucket: meta.bucket,
      };

      return handleImageResizing(fileMeta);
    });
});

*/
