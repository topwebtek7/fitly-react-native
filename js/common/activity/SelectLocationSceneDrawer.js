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
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { optionStyle, container, loginStyles } from '../../styles/styles.js'
import { save, clear } from '../../actions/drafts.js';
import MapView from 'react-native-maps';
import {getCurrentPosition, getPlaceByCoord, getPlaceByCoordGoogle} from '../../library/asyncGeolocation.js';
import PlaceSearchBox from '../PlaceSearchBox.js';
import ImmediatelyPoppedMarker from '../map/ImmediatelyPoppedMarker.js';
import Icon from 'react-native-vector-icons/Ionicons';
import { pop } from '../../actions/navigation.js';
import HeaderInView from '../../header/HeaderInView.js';
import Firebase from 'firebase';

//handling cases for storing in the redux draftState, and the case for editing existing location from the EventScene
class SelectLocationScene extends Component {
  constructor(props) {
    super(props);
    if (this.props.draftRef) {
      this.draftRef = this.props.draftRef;
      this.setDraftState = this.props.draftsAction.save.bind(this, this.draftRef);
    }
    this.state = {
      searchInput: '',
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      edit: false,
      marker: null,
    }
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
      location = this.props.location;
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
          latitudeDelta: 0,
          longitudeDelta: 0
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
            latitudeDelta: 0,
            longitudeDelta: 0
          },
          marker: {
            coordinate: {
              latitude: position.lat,
              longitude: position.lng,
            },
            address: formattedAddress,
            placeName: 'unamed'
          },
          updatedInDB: false,
        })
        this._animateToLocation({latitude: position.lat, longitude: position.lng});
      });
    }
  }

  _renderPlaceName() {
    const {edit, marker} = this.state;
    return (edit)
      ? <TextInput
        returnKeyType="done"
        maxLength={100}
        clearButtonMode="always"
        style={{width: 200, borderWidth:.5, borderColor: 'grey', marginRight: 15, borderRadius: 5}}
        onSubmitEditing={() => this.setState({edit: false})}
        onChangeText={(text) => {
          let newMarker = Object.assign({}, marker);
          newMarker.placeName = text;
          this.setState({
            marker: newMarker,
            updatedInDB: false,
          })
        }}
        value={marker.placeName}
        placeholderTextColor="white"
      />
      : <Text style={{fontSize: 18, marginRight: 15}}>{marker.placeName}</Text>
  }

  _setLocation() {
    let markerCopy = Object.assign({}, this.state.marker);
    markerCopy.coordinate = {
      lat: markerCopy.coordinate.latitude,
      lon: markerCopy.coordinate.longitude,
    };
    this.setState({edit: false});
    if (this.draftRef) {
      this.setDraftState({location: markerCopy});
      this.props.onPress();
    } else {
      Alert.alert(
        'WARNING',
        'You are about to change the location of the event',
        [
          {
            text: 'Cancel',
            onPress: () => {return}
          },
          {
            text: 'Change Location',
            onPress: () => {
              this.props.FitlyFirebase.database().ref('/events/' + this.props.eventID + '/location').set(markerCopy);
              this.props.FitlyFirebase.database().ref('/events/' + this.props.eventID + '/updatedAt').set(Firebase.database.ServerValue.TIMESTAMP);

              this.setState({
                updatedInDB: true
              },
              () => this.props.onPress()
            )
            },
            style: 'cancel'
          },
        ]
      )
    }
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
          placeName: 'unamed'
        },
        updatedInDB: false,
      })
    });
  };

  _renderConfirmBtn() {
    let location = (this.draftRef) ? this.props.drafts[this.draftRef].location : this.props.location;
    const {marker} = this.state;
    if (location && marker &&
        location.placeName === marker.placeName &&
        location.address === marker.address ||
        this.state.updatedInDB) {
      return (
        <TouchableHighlight onPress={() => this.props.onPress()}
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {this._renderPlaceName()}
                <TouchableHighlight onPress={() => this.setState({edit: true})}>
                  <Icon name="ios-create-outline" size={30} color="#bbb"/>
                </TouchableHighlight>
              </View>
              <Text style={{width: 250, textAlign: 'center'}}>{marker.address}</Text>
              {this._renderConfirmBtn()}
            </View>
          </MapView.Callout>
        </ImmediatelyPoppedMarker>
      : null;
  }

  _showMarker(data, details) {
    const coordinate = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: 0,
      longitudeDelta: 0
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

  _renderHeader() {
    return <HeaderInView
         leftElement={{icon: "ios-arrow-round-back-outline"}}
         title={(this.props.draftRef) ? 'Select Location' : 'Select New Location'}
         _onPressLeft={() => this.props.onPress()}
       />
  };

  render() {
    return (
      <View style={[optionStyle.container, {alignItems: 'center'}]}>
        {this.props.header && this._renderHeader()}
        <View
          style={{
            backgroundColor: "#ccc",
            alignSelf: 'stretch',
            borderTopWidth: .5,
            borderColor: '#7e7e7e',
            alignItems: 'center'}}>
            <TouchableOpacity
              style={{position: 'absolute', right: 10, width: 20}}
              onPress={()=>this.props.onPress()}>
              <Icon name="ios-close-outline" size={30} color="#000"/>
            </TouchableOpacity>
            <Icon name="ios-menu-outline" size={30} color="#000"/>
          </View>
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
        </MapView>
        <View style={optionStyle.searchBar}>
          <PlaceSearchBox onPress={this._showMarker}/>
        </View>
        <TouchableOpacity style={{width: 60, height: 60, borderRadius: 30, alignSelf: 'flex-end', top: 40, right: 20, alignItems: 'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,.8)'}} onPress={this._animateToCurrentLocation}>
          <Icon name="ios-locate-outline" size={30} color="#999"/>
        </TouchableOpacity>
      </View>
    )
  }
 }

 const mapStateToProps = function(state) {
  return {
    drafts: state.drafts.drafts,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    draftsAction: bindActionCreators({ save, clear }, dispatch),
    navigation: bindActionCreators({ pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectLocationScene);
