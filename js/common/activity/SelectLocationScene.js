/**
 * @flow
 */

import React, { Component } from 'react';
import {
  TouchableHighlight,
  Text,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { optionStyle, container, loginStyles } from '../../styles/styles.js';
import { save, clear } from '../../actions/drafts.js';
import MapView from 'react-native-maps';
import {
  getCurrentPosition,
  getPlaceByCoord,
  getPlaceByCoordGoogle,
} from '../../library/asyncGeolocation.js';
import PlaceSearchBox from '../PlaceSearchBox.js';
import ImmediatelyPoppedMarker from '../map/ImmediatelyPoppedMarker.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { pop } from '../../actions/navigation.js';
import HeaderInView from '../../header/HeaderInView.js';
import Firebase from 'firebase';

const deltaLatitude = 0.123;
const deltaLongitude = 0.123;
const isAndroid = Platform.OS === 'android';

const styles = {
  locationButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'flex-end',
    top: 40,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.8)',
  },
  locationInfo: {
    backgroundColor: 'rgb(255,255,255)',
    height: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 15,
  },
};

// handling cases for storing in the redux draftState, and the case for editing existing location from the EventScene
class SelectLocationScene extends Component {
  constructor(props) {
    super(props);
    if (this.props.navigation.state.params.draftRef) {
      this.draftRef = this.props.navigation.state.params.draftRef;
      this.setDraftState = this.props.draftsAction.save.bind(
        this,
        this.draftRef
      );
    }
    this.state = {
      searchInput: '',
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: deltaLatitude,
        longitudeDelta: deltaLongitude,
      },
      edit: false,
      marker: null,
    };
    this._onRegionChange = this._onRegionChange.bind(this);
    this._showMarker = this._showMarker.bind(this);
    this._setLocation = this._setLocation.bind(this);
    this._onLongPressMap = this._onLongPressMap.bind(this);
    this._animateToCurrentLocation = this._animateToCurrentLocation.bind(this);
    this._animateToLocation = this._animateToLocation.bind(this);
  }

  componentDidMount() {
    let location;
    if (this.draftRef) {
      location = this.props.drafts[this.draftRef].location;
    } else {
      location = this.props.navigation.state.params.location;
    }

    if (location.coordinate) {
      location.coordinate = {
        latitude: location.coordinate.lat,
        longitude: location.coordinate.lon,
      };
    }

    if (location.address) {
      this.setState({
        region: {
          ...location.coordinate,
          latitudeDelta: deltaLatitude,
          longitudeDelta: deltaLongitude,
        },
        marker: location,
      });
      this._animateToLocation(location.coordinate);
    } else {
      getCurrentPosition()
        .then(position =>
          getPlaceByCoord({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        )
        .then(geoLocation => {
          const { position, formattedAddress } = geoLocation;
          this.setState({
            region: {
              latitude: position.lat,
              longitude: position.lng,
              latitudeDelta: deltaLatitude,
              longitudeDelta: deltaLongitude,
            },
            marker: {
              coordinate: {
                latitude: position.lat,
                longitude: position.lng,
              },
              address: formattedAddress,
              placeName: 'unamed',
            },
            updatedInDB: false,
          });
          this._animateToLocation({
            latitude: position.lat,
            longitude: position.lng,
          });
        })
        .catch(e => {
          console.log('ERR while getting position', e);
        });
    }
  }

  _renderPlaceName() {
    const { edit, marker } = this.state;
    if (!marker) return null;
    return edit ? (
      <TextInput
        returnKeyType="done"
        maxLength={30}
        ref={r => (this.inputTextRef = r)}
        clearButtonMode="always"
        style={{
          width: 200,
          borderWidth: isAndroid ? 0 : 0.5,
          borderColor: 'grey',
          marginRight: 15,
          borderRadius: 5,
        }}
        onSubmitEditing={() => this.setState({ edit: false })}
        onChangeText={text => {
          const newMarker = Object.assign({}, marker);
          newMarker.placeName = text;
          this.setState({
            marker: newMarker,
            updatedInDB: false,
          });
        }}
        value={marker.placeName}
        placeholderTextColor="white"
      />
    ) : (
      <Text style={{ fontSize: 18, marginRight: 15 }}>{marker.placeName}</Text>
    );
  }

  _setLocation() {
    const markerCopy = Object.assign({}, this.state.marker);
    markerCopy.coordinate = {
      lat: markerCopy.coordinate.latitude,
      lon: markerCopy.coordinate.longitude,
    };
    this.setState({ edit: false });
    if (this.draftRef) {
      this.setDraftState({ location: markerCopy });
      this.props.navigation.goBack();
    } else {
      Alert.alert(
        'WARNING',
        'You are about to change the location of the event',
        [
          {
            text: 'Cancel',
            onPress: () => {},
          },
          {
            text: 'Change Location',
            onPress: () => {
              this.props.FitlyFirebase
                .database()
                .ref(
                  `/events/${this.props.navigation.state.params
                    .eventID}/location`
                )
                .set(markerCopy);
              this.props.FitlyFirebase
                .database()
                .ref(
                  `/events/${this.props.navigation.state.params
                    .eventID}/updatedAt`
                )
                .set(Firebase.database.ServerValue.TIMESTAMP);

              this.setState(
                {
                  updatedInDB: true,
                },
                () => this.props.navigation.goBack()
              );
            },
            style: 'cancel',
          },
        ]
      );
    }
  }

  // see: https://github.com/airbnb/react-native-maps/issues/580
  _onLongPressMap(event) {
    const { coordinate } = event.nativeEvent;
    getPlaceByCoord({
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    }).then(geocoding => {
      this.setState({
        marker: {
          coordinate,
          address: geocoding.formattedAddress,
          placeName: 'unamed',
        },
        updatedInDB: false,
      });
    });
  }

  _renderConfirmBtn() {
    const location = this.draftRef
      ? this.props.drafts[this.draftRef].location
      : this.props.navigation.state.params.location;
    const { marker } = this.state;
    if (
      (location &&
        marker &&
        location.placeName === marker.placeName &&
        location.address === marker.address) ||
      this.state.updatedInDB
    ) {
      return (
        <TouchableHighlight
          onPress={() => this.props.navigation.goBack()}
          style={{
            marginTop: 15,
            justifyContent: 'center',
            alignSelf: 'center',
            borderWidth: 0.5,
            borderColor: 'grey',
            width: 150,
            height: 30,
            borderRadius: 5,
          }}
        >
          <Text style={{ textAlign: 'center', color: 'green' }}>
            using this location
          </Text>
        </TouchableHighlight>
      );
    }
    return (
      <TouchableHighlight
        onPress={this._setLocation}
        style={{
          marginTop: 15,
          justifyContent: 'center',
          alignSelf: 'center',
          borderWidth: 0.5,
          borderColor: 'grey',
          width: 150,
          height: 30,
          borderRadius: 5,
        }}
      >
        <Text style={{ textAlign: 'center' }}>use this location</Text>
      </TouchableHighlight>
    );
  }

  _renderMarker_android = () => {
    const { marker } = this.state;
    return marker ? (
      <ImmediatelyPoppedMarker {...marker}>
        <MapView.Callout
          onPress={this._setLocation}
          style={{ flex: 0, position: 'relative' }}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: 15 }}>
                {marker.placeName}
              </Text>
            </View>
            <Text style={{ width: 250, textAlign: 'center' }}>
              {marker.address}
            </Text>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#eee',
                borderStyle: 'solid',
                padding: 5,
                marginTop: 10,
              }}
            >
              <Text>Accept Location</Text>
            </View>
          </View>
        </MapView.Callout>
      </ImmediatelyPoppedMarker>
    ) : null;
  };

  _renderMarker() {
    const { marker } = this.state;
    return marker ? (
      <ImmediatelyPoppedMarker {...marker}>
        <MapView.Callout
          onPress={this._setLocation}
          style={{ flex: 0, position: 'relative' }}
        >
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {this._renderPlaceName()}
              <TouchableHighlight
                onPress={() => {
                  console.log('SelectLocation: markerClicked');
                  this.setState({ edit: true });
                }}
              >
                <Icon name="ios-create-outline" size={30} color="#bbb" />
              </TouchableHighlight>
            </View>
            <Text style={{ width: 250, textAlign: 'center' }}>
              {marker.address}
            </Text>
            {this._renderConfirmBtn()}
          </View>
        </MapView.Callout>
      </ImmediatelyPoppedMarker>
    ) : null;
  }

  _showMarker(data, details) {
    const coordinate = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: deltaLatitude,
      longitudeDelta: deltaLongitude,
    };
    this.setState({
      marker: {
        coordinate,
        address: details.formatted_address,
        placeName: details.name,
      },
      region: coordinate,
    });
  }

  _animateToCurrentLocation() {
    getCurrentPosition().then(position => {
      this.refs.map.animateToCoordinate(position.coords);
    });
  }

  _animateToLocation(coords) {
    this.refs.map.animateToCoordinate(coords);
  }

  _onRegionChange(region) {
    this.setState({ region });
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{ icon: 'ios-arrow-round-back-outline' }}
        title={
          this.props.navigation.state.params.draftRef
            ? 'Select Location'
            : 'Select New Location'
        }
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  render() {
    const { width: screenWidth } = Dimensions.get('window');

    // https://github.com/airbnb/react-native-maps/issues/1337
    const fixBlackScreenAndroid = {
      borderWidth: 1,
      borderTopColor: '#1D2F7B',
    };
    return (
      <View
        style={[
          optionStyle.container,
          isAndroid ? fixBlackScreenAndroid : null,
        ]}
      >
        {this._renderHeader()}
        <MapView
          ref="map"
          style={optionStyle.map}
          region={this.state.region}
          onRegionChange={this._onRegionChange}
          onLongPress={this._onLongPressMap}
          showsUserLocation
          showsCompass
          loadEnable
        >
          {isAndroid ? this._renderMarker_android() : this._renderMarker()}
        </MapView>
        <View style={optionStyle.searchBar}>
          <PlaceSearchBox onPress={this._showMarker} />
        </View>

        {isAndroid &&
          this.state.marker && (
            <View style={[styles.locationInfo, { width: screenWidth }]}>
              {this._renderPlaceName()}
              <TouchableHighlight
                onPress={() => {
                  this.setState(
                    () => ({ edit: true }),
                    () => {
                      this.inputTextRef.focus();
                    }
                  );
                }}
              >
                <Icon name="ios-create-outline" size={30} color="#bbb" />
              </TouchableHighlight>
            </View>
          )}

        <TouchableOpacity
          style={styles.locationButton}
          onPress={this._animateToCurrentLocation}
        >
          <Icon name="ios-locate-outline" size={30} color="#999" />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    drafts: state.drafts.drafts,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    draftsAction: bindActionCreators({ save, clear }, dispatch),
    exnavigation: bindActionCreators({ pop }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  SelectLocationScene
);
