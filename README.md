# Fitly #
Currently support iOS only

## Installation ##
1. Install latest version of Xcode
2. Run npm install
3. Add firebase API keys to /credentials/firebaseConfig.js
4. Add GoogleService-Info.plist to ios/
5. Add Google place API key to /credentials/PLACE_API_KEY.js
5. Replace react-native-fm-picker module with the one on github: https://github.com/peter4k/React-Native-FMPicker

## Development ##
1. Majority of the development will be in /js
2. Open ios/Fitly.xcworkspace in Xcode
3. Choose the device to build on, and click build
4. The packager will open and build the file, this can take a while
5. If testing on physical device, configure your development server's ip address, refer to here: https://facebook.github.io/react-native/docs/running-on-device.html

## Icons ##
Get the icon names at http://ionicframework.com/docs/v2/ionicons/  or http://fontawesome.io/icons/ for the react-native-vector-icons library

## Issues ##
1. The React-Native-FMPicker module is out of date. Manually replace the index.js file in the node_modules/react-native-fm-picker with https://github.com/peter4k/React-Native-FMPicker/blob/master/index.js
2. Directly running 'react-native link' will cause numerous modules to fail, if you need to link a new module, only link that specific module, i.e. run 'react-native link #module name#'
3.Pod install React throws an error which cause Google maps to have issue installing

## TODOs ##
More TODOs can be found in the code. This list will grow.

- [ ] app
  - [ ] compress images for faster loading


- [ ] Onboarding
  - [ ] validate user input
  - [ ] forget password feature
  - [ ] stylistic details


- [ ] Local Storage
  - [ ] Persist redux store


- [ ] Profile Tab
  - [ ] show list of followers, followings and sessions when they are clicked
  - [ ] disallow photo duplication for uploads
  - [ ] let user create workouts
    - [ ] invite others for workouts
  - [ ] push notifications
  - [ ] feeds
    - [ ] include feeds for likes, replies
    - [ ] refactor with listView


- [ ] Search Tab
  - [ ] use elasticsearch and index database
  - [ ] create query API


- [ ] Activity Tab
  - [ ] search activity
  - [ ] show upcoming activities that are close to the user
  - [ ] allow user to choose what activities to show geographically

- [ ] Notification Tab
  - [ ] mimic the feeds

- [ ] Connect Tab
  - [ ] implement backend service


- [ ] Groups


- [ ] Settings
  - [ ] manage notifications
# My project's README
