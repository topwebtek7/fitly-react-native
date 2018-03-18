/**
 * @flow
 */

import React, { Component } from 'react';
import {
  TouchableHighlight,
  Text,
  View,
  TouchableOpacity,
  Platform
} from 'react-native';
import { container } from '../styles/styles.js'
import MapView from 'react-native-maps';
import {getCurrentPosition, getPlaceByCoord} from '../library/asyncGeolocation.js';
import ImmediatelyPoppedMarker from './map/ImmediatelyPoppedMarker.js';
import Icon from 'react-native-vector-icons/Ionicons';

const isAndroid = Platform.OS === 'android';
//handling cases for storing in the redux draftState, and the case for editing existing location from the EventScene
export default class InviewLocationPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: isAndroid ? 0.123 : 0.0922,
        longitudeDelta: isAndroid ? 0.123 :  0.0421,
      },
      marker: null,
      confirmed: false,
      onPartnerUpdate: false,
    }
    this._onRegionChange = this._onRegionChange.bind(this);
    this._showMarker = this._showMarker.bind(this);
    this._setLocation = this._setLocation.bind(this);
    this._onLongPressMap = this._onLongPressMap.bind(this);
    this._animateToCurrentLocation = this._animateToCurrentLocation.bind(this);
    this._animateToLocation = this._animateToLocation.bind(this);
  }

  componentDidMount() {
    getCurrentPosition()
    .then(position => getPlaceByCoord({lat: position.coords.latitude, lng: position.coords.longitude}))
    .then(geoLocation => {
      const {position, formattedAddress, subLocality} = geoLocation;
      this.setState({
        region: {
          latitude: position.lat,
          longitude: position.lng,
          latitudeDelta: isAndroid ? 0.123 : 0,
          longitudeDelta: isAndroid ? 0.123 : 0
        },
        marker: {
          coordinate: {
            latitude: position.lat,
            longitude: position.lng,
          },
          address: formattedAddress,
          placeName: subLocality
        },
      })
      this._animateToLocation({latitude: position.lat, longitude: position.lng});
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location && this.state.marker && nextProps.location.address !== this.state.marker.address) {
      this.setState({
        region: {
          latitude: nextProps.location.coordinate.lat,
          longitude: nextProps.location.coordinate.lon,
          latitudeDelta: isAndroid ? 0.123 : 0,
          longitudeDelta: isAndroid ? 0.123 : 0
        },
        marker: {
          ...nextProps.location,
          coordinate: {
            latitude: nextProps.location.coordinate.lat,
            longitude: nextProps.location.coordinate.lon,
          }
        },
        confirmed: false,
        onPartnerUpdate: true,
      })
    }
  }

  _setLocation() {
    let markerCopy = Object.assign({}, this.state.marker);
    markerCopy.coordinate = {
      lat: markerCopy.coordinate.latitude,
      lon: markerCopy.coordinate.longitude,
    };
    this.props.updateLocation(markerCopy);
    this.setState({
      confirmed: true,
      onPartnerUpdate: false
    })
  }

  //see: https://github.com/airbnb/react-native-maps/issues/580
  _onLongPressMap(event) {
    if (this.props.disabled) return;
    const {coordinate} = event.nativeEvent;
    getPlaceByCoord({lat: coordinate.latitude, lng: coordinate.longitude})
    .then(geocoding => {
      this.setState({
        marker: {
          coordinate,
          address: geocoding.formattedAddress,
          placeName: geocoding.subLocality
        },
        confirmed: false,
        onPartnerUpdate: false
      })
    });
  };

  _renderConfirmBtn() {
    const {location, disabled} = this.props;
    const {marker, confirmed} = this.state;
    if (location && marker && confirmed) {
      return (
        <TouchableHighlight onPress={() => {}}
          style={{marginTop: 5, justifyContent: 'center', alignSelf: 'center', borderWidth: .5, borderColor: 'grey', width: 120, height: 30, borderRadius: 5}}>
          <Text style={{textAlign: 'center', color: 'green'}}>Lets meet here!</Text>
        </TouchableHighlight>
      )
    } else if (this.props.disabled) {
      return null;
    } else {
      const btnText = (this.state.onPartnerUpdate) ? 'Want to meet here?' : 'use location';
      return (
        <TouchableHighlight onPress={this._setLocation}
          style={{marginTop: 5, justifyContent: 'center', alignSelf: 'center', borderWidth: .5, borderColor: 'grey', width: 120, height: 30, borderRadius: 5}}>
          <Text style={{textAlign: 'center'}}>{btnText}</Text>
        </TouchableHighlight>
      )
    }
  }

  _renderConfirmBtn_android = () => {
    const {location, disabled} = this.props;
    const {marker, confirmed} = this.state;

    if(this.props.disabled) return null;

    const locationConfirmed = !!location && !!marker && !!confirmed;
    let buttonText = (this.state.onPartnerUpdate) ? 'Want to meet here?' : 'use location';
    if(locationConfirmed){
      console.log('Change button', buttonText)
      buttonText = "Lets meet here!";
    }
    return (
      <View
          style={{marginTop: 5, justifyContent: 'center', alignSelf: 'center', borderWidth: 0, borderColor: 'grey', width: 120, height: 30, borderRadius: 5}}>
          <Text style={{textAlign: 'center', color: locationConfirmed ? 'green' : 'black'}}>{buttonText}</Text>
        </View>
    );
  }

  _handleAndroidClick = () => {
    let location = this.props.location;
    const {marker} = this.state;
    if (location && marker && this.state.confirmed) {
      return;
    } else if (this.props.disabled) {
      return;
    } else {
      this._setLocation()
    }
  }

  _renderMarker() {
    const {marker} = this.state;
    return (marker)
      ? <ImmediatelyPoppedMarker {...marker}>
          <MapView.Callout onPress={() => isAndroid ? this._handleAndroidClick() : null } style={this.props.popupStyle}>
            <View style={{alignItems:'center', padding: 10}}>
              <Text style={{fontSize: 14}}>{marker.placeName}</Text>
              <Text style={{width: 140, textAlign: 'center', fontSize: 12}}>{marker.address}</Text>
              {isAndroid ? this._renderConfirmBtn_android() : this._renderConfirmBtn()}
            </View>
          </MapView.Callout>
        </ImmediatelyPoppedMarker>
      : null;
  }

  _showMarker(data, details) {
    const coordinate = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: isAndroid ? 0.123 : 0,
      longitudeDelta: isAndroid ? 0.123 : 0
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
    getCurrentPosition()
    .then(position => {
      this.refs.map.animateToCoordinate(position.coords);
    });
  }

  _animateToLocation(coords) {
    this.refs.map.animateToCoordinate(coords);
  }

  _onRegionChange(region) {
    this.setState({ region });
  }

  render() {
    console.log('calling render')
    return (
      <View style={this.props.style || {}}>
        <MapView
          ref='map'
          showsMyLocationButton={false}
          style={this.props.mapStyle || {}}
          region={this.state.region}
          onRegionChange={this._onRegionChange}
          onLongPress={this._onLongPressMap}
          showsUserLocation={true}
          showsCompass={true}
          >
          {this._renderMarker()}
        </MapView>
        <TouchableOpacity style={{width: 60, height: 60, borderRadius: 30, alignSelf: 'flex-end', top: 40, right: 20, alignItems: 'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,.8)'}} onPress={this._animateToCurrentLocation}>
          <Icon name="ios-locate-outline" size={30} color="#999"/>
        </TouchableOpacity>
      </View>
    )
  }
 }
