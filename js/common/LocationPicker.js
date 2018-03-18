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
  Slider,
  Dimensions,
  InteractionManager,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { optionStyle, container, loginStyles } from '../styles/styles.js'
import MapView from 'react-native-maps';
import {getCurrentPosition, getPlaceByCoord, getPlaceByCoordGoogle} from '../library/asyncGeolocation.js';
import PlaceSearchBox from './PlaceSearchBox.js';
import ImmediatelyPoppedMarker from './map/ImmediatelyPoppedMarker.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { pop } from '../actions/navigation.js';
import HeaderInView from '../header/HeaderInView.js';
import { setSearchLocation } from '../actions/app.js';

const latitudeDelta = 5;
const longitudeDelta = 5;

//handling cases for storing in the redux draftState, and the case for editing existing location from the EventScene
class LocationPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      },
      marker: null,
      confirmed: false,
      radius: this.props.searchLocation.radius
    }
    this._onRegionChange = this._onRegionChange.bind(this);
    this._showMarker = this._showMarker.bind(this);
    this._setLocation = this._setLocation.bind(this);
    this._onLongPressMap = this._onLongPressMap.bind(this);
    this._animateToCurrentLocation = this._animateToCurrentLocation.bind(this);
    this._animateToLocation = this._animateToLocation.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(()=>{
      setTimeout(this._loadMap.bind(this), 1000);
    })
  }

  _loadMap(){
    let location = Object.assign({}, this.props.searchLocation);

    if (location.coordinate) {
        location.coordinate = {
        latitude: location.coordinate.lat,
        longitude: location.coordinate.lon,
      };
    }
    console.log('location.cord', location.coordinate)
    if (location.address) {
      this.setState({
        region: {
          ...location.coordinate,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta
        },
        marker: location,
      });
      this._animateToLocation(location.coordinate);
    } else {
      getCurrentPosition()
      .then(position => getPlaceByCoord({lat: position.coords.latitude, lng: position.coords.longitude}))
      .then(geoLocation => {
        const {position, formattedAddress} = geoLocation;
        this.setState({
          region: {
            latitude: position.lat,
            longitude: position.lng,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta
          },
          marker: {
            coordinate: {
              latitude: position.lat,
              longitude: position.lng,
            },
            address: formattedAddress,
            placeName: 'current location'
          },
        })
        this._animateToLocation({latitude: position.lat, longitude: position.lng});
      });
    }
  }

  _renderPlaceName() {
    const {marker} = this.state;
    return <Text style={{fontSize: 18, marginRight: 15}}>{marker.placeName}</Text>;
  }

  _setLocation() {
    let markerCopy = Object.assign({}, this.state.marker);
    markerCopy.coordinate = {
      lat: markerCopy.coordinate.latitude,
      lon: markerCopy.coordinate.longitude,
    };
    this.props.action.setSearchLocation({
      ...markerCopy,
      radius: this.state.radius,
    });
    this.setState({
      confirmed: true
    }, () => this.props.navigation.goBack())
  }

  //see: https://github.com/airbnb/react-native-maps/issues/580
  _onLongPressMap(event) {
    const {coordinate} = event.nativeEvent;

    getPlaceByCoord({lat: coordinate.latitude, lng: coordinate.longitude})
    .then(geocoding => {
      this.setState({
        marker: {
          coordinate,
          address: geocoding.formattedAddress,
          placeName: 'new location'
        },
        confirmed: false,
      })
      this.props.action.setSearchLocation({
        coordinate: {lat: coordinate.latitude, lng: coordinate.longitude},
        radius: this.state.radius,
      });
      this._animateToLocation({latitude: coordinate.latitude, longitude: coordinate.longitude})
    });
  };

  _renderConfirmBtn() {
    let location = this.props.location;
    const {marker} = this.state;
    if (location && marker &&
        location.address === marker.address ||
        this.state.confirmed) {
      return (
        <TouchableHighlight onPress={() => this.props.navigation.goBack()}
          style={{marginTop: 15, justifyContent: 'center', alignSelf: 'center', borderWidth: .5, borderColor: 'grey', width: 150, height: 30, borderRadius: 5}}>
          <Text style={{textAlign: 'center', color: 'green'}}>using this location</Text>
        </TouchableHighlight>
      )
    } else {
      return (
        <TouchableHighlight onPress={this._setLocation}
          style={{marginTop: 15, justifyContent: 'center', alignSelf: 'center', borderWidth: .5, borderColor: 'grey', width: 150, height: 30, borderRadius: 5}}>
          <Text style={{textAlign: 'center'}}>use this location</Text>
        </TouchableHighlight>
      )
    }
  }

  _renderMarker() {
    const {marker} = this.state;
    return (marker)
      ? <ImmediatelyPoppedMarker {...marker}>
          <MapView.Callout style={{ flex: 0, position: 'relative' }}>
            <View style={{alignItems:'center'}}>
              {this._renderPlaceName()}
              <Text style={{width: 250, textAlign: 'center'}}>{marker.address}</Text>
              {this._renderConfirmBtn()}
            </View>
          </MapView.Callout>
        </ImmediatelyPoppedMarker>
      : null;
  }

  _renderRadiusCircle() {
    const {marker} = this.state;
    return (marker)
      ? <MapView.Circle
          key={this.state.radius + marker.coordinate.latitude}
          center={this.state.marker.coordinate}
          radius={this.state.radius}
          fillColor={'rgba(100, 136, 193,.2)'}
          strokeColor={'rgba(100, 136, 193, 1)'}
          strokeWidth={.5}
          zIndex={10}
        />
      : null;
  }

  _showMarker(data, details) {
    const coordinate = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: latitudeDelta,
      longitudeDelta: longitudeDelta
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

  _fitToCoordinates(val){
    let lDelt = Math.round(val/1609.34) * .05 / 2;
    const {latitude, longitude } = this.state.region;
    let bounds = [{latitude: latitude - lDelt, longitude: longitude}, {latitude: latitude + lDelt, longitude: longitude}]

    this.refs.map.fitToCoordinates(bounds, {
      animated: true,
    })
  }

  _onRegionChange(region) {
    this.setState({ region });
  }

  _renderHeader() {
    return <HeaderInView
     leftElement={{icon: "ios-arrow-round-back-outline"}}
     title={(this.props.draftRef) ? 'Select Location' : 'Select New Location'}
     _onPressLeft={() => this.props.navigation.goBack()}
   />
  };

  _renderRadiusBtns() {
    let sideLength = 60;
    let small = 20;
    let mid = 30;
    let big = 40;
    let iconSize = 40;
    let btnColor = 'rgba(0,0,0,.2)';
    let btnContainerStyle = {width: sideLength, height: sideLength, backgroundColor: 'transparent', alignItems: 'center', justifyContent:'center'};
    return <View style={{height: sideLength, borderRadius: sideLength/2, alignItems: 'center', flexDirection: 'row', position:'absolute', left: 20, right: 20, bottom: 30, justifyContent:'space-around', backgroundColor:'rgba(255,255,255,.3)'}}>
      <TouchableOpacity style={{...btnContainerStyle}} onPress={() => this._setRadius('decrease')}>
        <Icon name="ios-remove-outline" size={iconSize} color="#000"/>
      </TouchableOpacity>
      <Text style={{textAlign: 'center'}}>{'radius: ' + '\n' + `within ${Math.round(this.state.radius / 1609.34)} miles`}</Text>
      <TouchableOpacity style={{...btnContainerStyle}} onPress={() => this._setRadius('increase')}>
        <Icon name="ios-add-outline" size={iconSize} color="#000"/>
      </TouchableOpacity>
    </View>
  }

  _renderRadiusSlider(){
    let sliderWidth = Dimensions.get('window').width - 60;

    return (
      <View style={{
          flex: 1, height: 100, borderRadius: 25, alignItems: 'center', position:'absolute', left: 20, right: 20, bottom: 30, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.3)',
        }}>
        <Text style={{textAlign: 'center'}}>{'radius: ' + '\n' + `within ${Math.round(this.state.radius / 1609.34)} miles`}</Text>
        <Slider
          style={{width: sliderWidth}}
          value={this.state.radius}
          minimumValue={1609.34 * 3}
          maximumValue={1609.34 * 30}
          step={1609.34}
          onValueChange={this._changeRadius.bind(this)}
          onSlidingComplete={this._setNewRadius.bind(this)}/>
      </View>
    )
  }

  _changeRadius(value){
    this.setState({ radius: value })
  }

  _setNewRadius(){
    this.props.action.setSearchLocation({
      radius: this.state.radius,
    }, this._fitToCoordinates(this.state.radius))
  }

  _setRadius(action) {
    let newRadius;
    if (action === 'decrease') {
      newRadius = (this.state.radius > 1609.34 * 3) ? this.state.radius - 1609.34 : this.state.radius;
    } else {
      newRadius = (this.state.radius < 1609.34 * 30) ? this.state.radius + 1609.34 : this.state.radius;
    }
    this.setState({
      radius: newRadius
    });
    this.props.action.setSearchLocation({
      radius: newRadius,
    });
  }


  render() {
    return (
      <View style={[optionStyle.container, {alignItems: 'center'}]}>
        {this._renderHeader()}
        <MapView
          ref='map'
          style={optionStyle.map}
          region={this.state.region}
          onRegionChange={this._onRegionChange}
          onLongPress={this._onLongPressMap}
          showsUserLocation={true}
          showsCompass={true}
          >
          {this._renderMarker()}
          {this._renderRadiusCircle()}
        </MapView>
        <View style={optionStyle.searchBar}>
          <PlaceSearchBox onPress={this._showMarker}/>
        </View>
        <TouchableOpacity style={{width: 60, height: 60, borderRadius: 30, alignSelf: 'flex-end', top: 40, right: 20, alignItems: 'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,.8)'}} onPress={this._animateToCurrentLocation}>
          <Icon name="ios-locate-outline" size={30} color="#999"/>
        </TouchableOpacity>
        {this._renderRadiusSlider()}
      </View>
    )
  }
 }


 const mapStateToProps = (state) => {
  return {
    searchLocation: state.app.searchLocation,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    action: bindActionCreators({ setSearchLocation }, dispatch),
    exnavigation: bindActionCreators({ pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationPicker);
