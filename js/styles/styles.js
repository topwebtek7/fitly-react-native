import { StyleSheet, Animated, Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';

const centering = {
  alignItems: 'center',
  justifyContent: 'center'
};

export const container = {
  flex: 1,
  backgroundColor: 'white'
};

const centeringContainer = {
  ...container,
  ...centering
};

const composeInputBox = {
  flex: 0,
  paddingTop: 3,
  paddingBottom: 3,
  alignSelf: 'stretch',
  borderColor: '#ccc'
};

const absoluteFullWidth = {
  position: 'absolute',
  left: 0,
  right: 0
};

const scrollContentContainer = {
  flex: 0,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
};

const FitlyBlueClear = 'rgba(29,47,123,.8)';
export const FitlyBlue = '#1D2F7B';
const clearBackground = 'rgba(255,255,255,0)';
export const headerHeight = isAndroid ? 60 : 80;
export const tabHeight = 50;
const selectedTabHeight = 55;
export const tabColor = 'rgba(61,61,61,1)';
export const tabColorClear = 'rgba(61,61,61,.8)';
export const alternateBlue = '#326fd1';

export const loadingStyle = StyleSheet.create({
  app: {
    flex: 1,
    ...centering
  }
});

export const headerStyle = StyleSheet.create({
  header: {
    flex: 0,
    height: headerHeight,
    backgroundColor: FitlyBlue
  },
  inlineHeader: {
    alignSelf: 'stretch',
    flex: 0,
    height: headerHeight,
    backgroundColor: FitlyBlue,
    top: 0,
    zIndex: 3,
    // flexDirection: 'row',
    ...centering
  },
  container: {
    flex: 0,
    flexDirection: 'row',
    ...centering
  },
  logoText: {
    position: 'absolute',
    paddingTop: 10,
    left: -30,
    fontFamily: 'HelveticaNeue',
    fontSize: 30,
    color: 'white',
    fontWeight: '700',
    letterSpacing: -1
  },
  msgBtn: {
    position: 'absolute',
    paddingTop: 15,
    right: 25
  },
  settingsBtn: {
    position: 'absolute',
    paddingTop: 16,
    right: -25
  },
  titleText: {
    color: 'white',
    //paddingTop: 13,
    paddingTop: isAndroid ? 0 : 13,
    fontWeight: '600',
    fontSize: 20,
    textAlign: 'center'
  },
  logoutBtn: {
    position: 'absolute',
    paddingTop: 16,
    right: -25
  },
  logoutBtnText: {
    fontWeight: '100',
    color: 'white'
  },
  closeBtn: {
    paddingLeft: 20,
    paddingTop: isAndroid ? 5 : 20
  },
  text: {
    color: 'white',
    fontSize: 15
  }
});

export const commonStyle = StyleSheet.create({
  error: {
    height: 40,
    width: 250,
    fontWeight: '100',
    textAlign: 'center',
    color: '#FF0000'
  },
  success: {
    height: 40,
    fontWeight: '100',
    textAlign: 'center',
    color: 'green'
  },
  hidden: {
    height: 0,
    width: 0
  },
  container: {
    flex: 1,
    alignItems: 'center'
  },
  notification: {
    height: 40,
    width: 250,
    fontWeight: '100',
    textAlign: 'center',
    color: '#FFbbbb'
  }
});

export const tabStyle = StyleSheet.create({
  tabBar: {
    ...absoluteFullWidth,
    bottom: 0,
    height: 55,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: FitlyBlue,
    alignItems: 'flex-end'
  },
  tab: {
    backgroundColor: tabColor,
    height: 55,
    // flex:1,
    // borderColor: 'black',
    // borderLeftWidth: .5,
    // borderRightWidth: .5,
    ...centering
  },
  selectedTab: {
    backgroundColor: FitlyBlueClear,
    // borderTopRightRadius: 7,
    // borderTopLeftRadius: 7,
    // height: selectedTabHeight,
    // flex:1,
    height: 55,
    ...centering
    // shadowColor: FitlyBlue,
    // shadowOpacity: .6,
    // shadowOffset: {width: 0, height: 0},
    // shadowRadius: 2,
    // zIndex: 10,
    // elevation: 2,
    // borderColor: 'black',
    // borderLeftWidth: .5,
    // borderRightWidth: .5,
  }
});

let commonLoginStyle = {
  container: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: FitlyBlue
  },
  logo: {
    fontFamily: 'HelveticaNeue',
    fontSize: 100,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingTop: 80,
    paddingBottom: 45,
    letterSpacing: -2
  },
  header: {
    textAlign: 'center',
    alignSelf: 'stretch',
    fontFamily: 'HelveticaNeue',
    fontSize: 40,
    color: 'white',
    fontWeight: '400',
    paddingTop: 80,
    paddingBottom: 45
  },
  FBbtn: {
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: 48,
    width: 260,
    backgroundColor: 'white'
  },
  Btn: {
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: 48,
    width: 260,
    marginBottom: 15,
    backgroundColor: 'white'
  },
  input: {
    height: 40,
    width: 270,
    fontWeight: '100',
    textAlign: 'center',
    color: '#FFFFFF'
  },
  form: {
    borderColor: 'white',
    borderBottomWidth: 0.5,
    marginBottom: 20
  },
  swipeBtn: {
    alignSelf: 'stretch',
    height: 50,
    borderColor: '#FFFFFF',
    backgroundColor: 'white',
    justifyContent: 'center',
    bottom: 0,
    ...absoluteFullWidth
  },
  textMid: {
    fontSize: 15,
    margin: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700'
  },
  textSmall: {
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF'
  },
  boldSmall: {
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700'
  },
  btnText: {
    fontSize: 18,
    textAlign: 'center',
    color: FitlyBlue
  },
  disclamerText: {
    fontSize: 12,
    marginBottom: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 5,
    width: 300
  }
};

export const loginStyles = StyleSheet.create(commonLoginStyle);
export const loginStylesInverse = StyleSheet.create({
  ...commonLoginStyle,
  container: {
    ...commonLoginStyle.container,
    backgroundColor: '#FFFFFF'
  },
  input: {
    ...commonLoginStyle.input,
    color: FitlyBlue
  },
  textSmall: {
    ...commonLoginStyle.textSmall,
    color: FitlyBlue
  },
  disclamerText: {
    ...commonLoginStyle.disclamerText,
    color: '#FFFFFF'
  },
  Btn: {
    ...commonLoginStyle.Btn,
    backgroundColor: FitlyBlue
  },
  form: {
    ...commonLoginStyle.form,
    borderColor: FitlyBlue
  },
  btnText: {
    ...commonLoginStyle.btnText,
    color: '#FFFFFF'
  },
  textMid: {
    ...commonLoginStyle.textMid,
    color: '#aaa'
  },
  header: {
    ...commonLoginStyle.header,
    color: FitlyBlue
  },
  swipeBtn: {
    ...commonLoginStyle.swipeBtn,
    backgroundColor: FitlyBlue,
    borderColor: FitlyBlue
  },
  FBbtn: {
    ...commonLoginStyle.FBbtn,
    backgroundColor: FitlyBlue
  }
});

export const welcomeStyles = StyleSheet.create({
  container: {
    ...centeringContainer,
    backgroundColor: FitlyBlue
  },
  logoContainer: {
    ...centeringContainer,
    justifyContent: 'space-around',
    backgroundColor: FitlyBlue
  },
  buttonContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    width: 300,
    paddingBottom: 20
  },
  logo: {
    fontFamily: 'HelveticaNeue',
    fontSize: 100,
    color: 'white',
    fontWeight: '700',
    letterSpacing: -2
  },
  messageText: {
    fontSize: 40,
    marginBottom: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 5
  },
  messageTextLight: {
    marginTop: 40,
    width: 220,
    fontSize: 18,
    marginBottom: 0,
    textAlign: 'center',
    color: '#bbbbbb',
    marginBottom: 5
  },
  buttonTextInverted: {
    fontSize: 20,
    marginBottom: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 5
  },
  actionButtonInverted: {
    height: 50,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    backgroundColor: FitlyBlue,
    alignSelf: 'stretch',
    marginVertical: 5
  },
  buttonText: {
    fontSize: 20,
    marginBottom: 0,
    textAlign: 'center',
    color: FitlyBlue,
    marginBottom: 5
  },
  actionButton: {
    height: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 0.5,
    alignSelf: 'stretch',
    marginVertical: 5
  }
});
export const composeStyle = StyleSheet.create({
  container: {
    ...centeringContainer
  },
  scrollContentContainer: {
    ...scrollContentContainer
  },
  input: {
    fontSize: 20,
    minHeight: 40,
    alignSelf: 'stretch',
    fontWeight: '100',
    textAlign: 'left',
    color: 'black',
    marginLeft: 20,
    marginRight: 20
    // marginTop: 10,
  },
  inputBox: {
    flex: 0,
    paddingTop: 3,
    paddingBottom: 3,
    alignSelf: 'stretch',
    borderColor: '#ccc',
    borderTopWidth: 0.5
  },
  photosSection: {
    flex: 0,
    alignSelf: 'stretch',
    // borderWidth: 1,
    minHeight: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    paddingLeft: 20,
    paddingRight: 20
  },
  imgLarge: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 5,
    backgroundColor: 'white',
    // alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1
  },
  closeBtn: {
    zIndex: 2,
    position: 'absolute',
    right: 20,
    top: 10,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  photoThumbnail: {
    borderWidth: 0.5,
    borderColor: '#aaa',
    ...centering,
    height: 100,
    width: 100,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5
  },
  category: {
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: FitlyBlue,
    width: 250,
    height: 50,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 10
  },
  categoryText: {
    fontFamily: 'HelveticaNeue',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
    color: FitlyBlue,
    fontSize: 20
  },
  defaultImg: {
    // marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 15,
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 30,
    height: 30,
    borderWidth: 0.5,
    borderColor: FitlyBlue,
    justifyContent: 'center'
  },
  trainerImg: {
    // marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 15,
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 30,
    height: 30,
    borderWidth: 0.5,
    borderColor: '#FF0000',
    justifyContent: 'center'
  },
  proImg: {
    // marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 15,
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: 30,
    height: 30,
    borderWidth: 0.5,
    borderColor: 'gold',
    justifyContent: 'center'
  },
  hashTagInput: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    flex: 0,
    justifyContent: 'flex-start',
    borderColor: '#ccc',
    borderBottomWidth: 0.5
  },
  hashTag: {
    backgroundColor: 'rgba(255,255,255,0)',
    fontSize: 20,
    color: '#bbb',
    marginTop: 5,
    marginRight: 5
  }
});
export const profileStyle = StyleSheet.create({
  container: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  },
  defaultImg: {
    marginTop: 20,
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: alternateBlue,
    justifyContent: 'center'
  },
  trainerImg: {
    marginTop: 20,
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#FF0000',
    justifyContent: 'center',
    overlayColor: 'white'
  },
  proImg: {
    marginTop: 20,
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: 'gold',
    justifyContent: 'center'
  },
  updateProfileBtn: {
    marginTop: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: FitlyBlue,
    position: 'absolute',
    top: 50 + 15, //parent radius + self radius
    right: 0
  },
  blueBtn: {
    flex: 1,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: FitlyBlue,
    position: 'absolute',
    bottom: 60,
    right: 10,
    zIndex: 99,
    shadowColor: '#aaa',
    shadowOpacity: 0.6,
    elevation: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dashboard: {
    flex: 0,
    zIndex: -2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    paddingTop: 4,
    paddingBottom: 2,
    borderColor: '#ccc'
  },
  dashboardItem: {
    ...centering
  },
  centeredText: {
    textAlign: 'center'
  },
  nameText: {
    fontSize: 26,
    paddingTop: 8,
    paddingBottom: 8
  },
  summaryText: {
    fontSize: 12,
    paddingBottom: 10,
    textAlign: 'center'
  },
  summaryTextEdit: {
    fontSize: 12,
    paddingBottom: 10,
    textAlign: 'center'
  },
  dashboardTextColor: {
    color: alternateBlue,
    fontSize: 20,
    paddingBottom: 10
  },
  dashboardText: {
    color: 'grey',
    fontSize: 12,
    paddingBottom: 8
  },
  followBtn: {
    borderRadius: 2,
    backgroundColor: FitlyBlue,
    width: 170,
    height: 40,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    elevation: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  followBtnDD: {
    borderRadius: 2,
    backgroundColor: FitlyBlue,
    width: 170,
    height: 40,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: 'black',
    shadowOpacity: 0.6,
    elevation: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  summaryTextBox: {
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 5,
    fontSize: 15,
    width: 200,
    // paddingLeft: 10,
    // paddingRight:10,
    paddingBottom: 10,
    textAlign: 'center'
  },
  summaryTextBtn: {
    fontSize: 13,
    color: 'grey',
    marginTop: 10
  },
  createBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 90
  },
  createBtn: {
    alignItems: 'center'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export const feedEntryStyle = StyleSheet.create({
  container: {
    flex: 0,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    alignSelf: 'stretch',
    borderBottomWidth: 0.5,
    borderColor: '#ccc'
  },
  imgContainer: {
    flex: 0,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  images: {
    width: 71,
    height: 71
  },
  imagesTouchable: {
    marginRight: 12,
    marginBottom: 12,
    width: 71,
    height: 71,
    borderWidth: 0.5,
    borderColor: '#ccc'
  },
  profileRow: {
    flex: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  username: {
    marginLeft: 10
  },
  timestamp: {
    backgroundColor: 'rgba(255,255,255,0)',
    color: 'grey',
    fontSize: 10,
    right: 0,
    top: 10,
    position: 'absolute',
    right: 15
  },
  smallDescription: {
    backgroundColor: 'rgba(255,255,255,0)',
    color: 'grey',
    fontSize: 9,
    left: 10,
    paddingBottom: 10,
    position: 'absolute'
  },
  description: {
    marginLeft: 10,
    fontSize: 10,
    color: 'grey'
  },
  defaultImg: {
    borderRadius: 23,
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: FitlyBlue,
    justifyContent: 'center'
  },
  trainerImg: {
    borderRadius: 23,
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: '#FF0000',
    justifyContent: 'center'
  },
  proImg: {
    borderRadius: 23,
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: 'gold',
    justifyContent: 'center'
  },
  photoFeedContainer: {
    marginTop: 1,
    flex: 0,
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  photoFeedEntry: {}
});

export const postStyle = StyleSheet.create({
  scrollContentContainer: {
    ...scrollContentContainer
  },
  postContainer: {
    alignSelf: 'stretch',
    marginTop: 20,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
    paddingBottom: 15
  },
  postContent: {
    marginLeft: 30,
    marginRight: 30
  },
  imgContainer: {
    flex: 0,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  imagesTouchable: {
    marginRight: 10,
    marginBottom: 10,
    width: 80,
    height: 80,
    borderWidth: 0.5,
    borderColor: '#ccc'
  },
  images: {
    width: 80,
    height: 80
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 10
  },
  textContent: {
    fontSize: 13,
    paddingBottom: 20
  },
  socialBtns: {
    backgroundColor: 'rgba(255,255,255,0)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'stretch'
  },
  iconText: {
    color: 'grey',
    fontSize: 9,
    textAlign: 'center'
  },
  socialIcon: {
    width: 40,
    // marginTop: 15,
    // paddingRight: 10,
    alignItems: 'center'
  },
  tagsRow: {
    flex: 0,
    marginTop: 10,
    marginLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tags: {
    fontSize: 13,
    color: 'grey',
    paddingRight: 10
  },
  comment: {},
  inputBar: {
    flex: 1,
    backgroundColor: '#eee',
    borderWidth: 0.5,
    borderColor: '#ddd',
    ...absoluteFullWidth,
    bottom: 0,
    justifyContent: 'center'
  },
  replyInput: {
    paddingLeft: 10,
    paddingTop: 2,
    marginTop: 7,
    marginBottom: 7,
    alignSelf: 'stretch',
    fontWeight: '100',
    textAlign: 'left',
    color: 'black',
    marginLeft: 20,
    marginRight: 60,
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 16,
    backgroundColor: 'white'
  },
  cameraBtn: {
    position: 'absolute',
    right: 16,
    top: 6
  }
});

export const optionStyle = StyleSheet.create({
  container: {
    ...container,
    backgroundColor: '#eee'
  },
  entry: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'stretch',
    minHeight: 65,
    borderColor: '#eee',
    borderBottomWidth: 0.5
  },
  eventEntryContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'stretch',
    minHeight: 65,
    borderColor: '#eee',
    borderBottomWidth: 0.5,
    paddingRight: 15
  },
  eventEntryLeft: {
    marginLeft: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    // flex: 1,
    // alignSelf: 'stretch',
    flexDirection: 'row'
  },
  eventEntryRight: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexGrow: 1,
    alignSelf: 'stretch',
    flexDirection: 'row'
    // borderColor: 'red',
    // borderWidth: 1,
  },
  searchBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignSelf: 'stretch',
    borderColor: '#eee',
    borderBottomWidth: 0.5
  },
  map: {
    left: 0,
    right: 0,
    top: 43,
    bottom: 0,
    // height: 400,
    position: 'absolute',
    backgroundColor: 'red',
    zIndex: -2
  },
  label: {
    fontSize: 16,
    marginLeft: 15
  },
  datePicker: {
    // position: 'absolute'
    marginRight: 15,
    flex: 1
  },
  inputBar: {
    ...composeInputBox,
    borderBottomWidth: 0.5
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: 15
  }
});

export const eventStyle = StyleSheet.create({
  btnTrue: {
    backgroundColor: FitlyBlue,
    borderColor: alternateBlue,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnFalse: {
    backgroundColor: FitlyBlueClear,
    borderColor: FitlyBlueClear,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  goingBtnText: {
    textAlign: 'center',
    color: 'white'
  },
  attendStatusContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  titleContainer: {
    alignSelf: 'stretch',
    justifyContent: 'flex-end'
    // backgroundColor: 'rgba(255,255,255,.8)'
  },
  entryContainer: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15
  },
  reverseEntryContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
    // flexDirection: 'row',
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
    paddingBottom: 5
  },
  icon: {
    // marginLeft: 15,
  },
  text: {
    color: 'white'
  },
  textContent: {
    fontSize: 15,
    paddingRight: 30,
    textAlign: 'right',
    color: 'white',
    alignSelf: 'stretch'
    // backgroundColor: 'rgba(0,0,0,.5)',
  },
  title: {
    color: 'white',
    paddingTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600'
  }
});

export const activityTabStyle = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'white'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#555',
    height: 50,
    position: 'absolute',
    bottom: tabHeight,
    left: 0,
    right: 0
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerBtnText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16
  },
  eventEntry: {
    flex: 1,
    //height: 100,
    borderColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row'
  },
  eventEntryText: {
    //marginTop: 10,
    marginVertical: 5,
    fontSize: 16,
    color: '#999',
    fontWeight: '500'
  }
});

export const datepickerStyle = StyleSheet.create({
  dateIcon: {
    left: 0,
    marginLeft: 15
  },
  dateInput: {
    borderWidth: 0
  },
  dateText: {
    color: 'black'
    // textAlign: 'right',
  },
  btnCancel: {},
  dateTouchBody: {
    alignSelf: 'flex-start',
    flex: 1
  },
  placeholderText: {
    color: 'black'
  },
  btnTextConfirm: {
    color: '#007AFF'
  }
});
