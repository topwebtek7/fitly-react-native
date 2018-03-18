import React, {Component} from 'react';
import { ScrollView, Image, View, Text, TouchableOpacity, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import Firebase from 'firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import Carousel from 'react-native-carousel';
import { selectPictureCropper, getImageFromCam } from '../library/pictureHelper.js';
import { uploadPhoto } from '../library/firebaseHelpers.js';

import HeaderInView from '../header/HeaderInView.js';

const { width, height } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

class ProfilePicsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pictures: [],
    };

    this.database = this.props.FitlyFirebase.database();
    this.uID = this.props.navigation.state.params.uID;
    this.dbLocation = 'users/'+this.uID+'/public/';
    this.storageLocation = 'users/'+this.uID+'/profilePic/';
  };

  componentDidMount() {
    this.database.ref(this.dbLocation+'profilePictures').once('value')
      .then(snap => {
        if (!snap.val()) return;
        this.setState({
          pictures: this.state.pictures.concat(Object.values(snap.val()))
        });
      });
  }

  _renderHeader = () => {
    const customStyles = { zIndex: 0 };
    return (
      <HeaderInView
        customStyles={isAndroid ? customStyles : []}
        leftElement={{ icon: 'ios-close' }}
        title={'Profile Photos'}
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  _takePhoto = () => {
    getImageFromCam(picture => this._storePhoto(picture.path));
  }

  _uploadPhoto = () => {
    selectPictureCropper().then(picture => this._storePhoto(picture.uri));
  }

  _storePhoto = (uri) => {
    //this.setState({ loading: true });
    uploadPhoto(this.storageLocation, uri, {
      //profile: true,
      profile: false,
    })
    .then(link => {
      this.database.ref(this.dbLocation+'profilePictures').push().set(link);
      return link;
    })
    .then(link => {
      this.setState({pictures: this.state.pictures.concat(link)});
      //this.setState({ loading: false })
    })
    .catch(error => {
      //this.setState({ loading: false });
      console.log('upload in profile pics view', error);
    });
  }

  render() {
    //console.log("pictures", this.state.pictures);
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {this._renderHeader()}
        <View style={{flex: .9}}>
          <Carousel
            width={width}
            loop={false}
            animate={false}
            indicatorSize={30}
            indicatorOffset={0}
            indicatorColor='black'
            inactiveIndicatorColor='white'
          >
            {this.state.pictures.map((p,i) => (
              <View key={i} style={{flex: 1, width: width}}>
                <Image
                  source={{uri: p}}
                  //style={{width: undefined, height: undefined}}
                  style={{flex: 1}}
                />
              </View>
            ))}
          </Carousel>
        </View>
        <View style={{flex: .1}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={this._takePhoto}
              style={{
                flex: .5,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: .5,
              }}
            >
              <Text>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this._uploadPhoto}
              style={{
                flex: .5,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: .5,
              }}
            >
              <Text>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    //uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    //exnavigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePicsView);
