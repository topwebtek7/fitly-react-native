import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { optionStyle, container, loginStyles } from '../../styles/styles.js'
import {getCurrentPosition, getPlaceByCoord, getPlaceByCoordGoogle} from '../../library/asyncGeolocation.js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const screenWidth = Dimensions.get('window').width;

class Map extends Component{
  constructor(props){
    super(props);
    this.state = {
      growAnim: new Animated.Value(130),
      searchInput: '',
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      edit: false,
      marker: null,
      focus: false,
    }
    this.mapHeight = 130;
  }

  componentDidMount() {
      getCurrentPosition()
      .then(position => getPlaceByCoord({lat: position.coords.latitude, lng: position.coords.longitude})).then(geoLocation => {
        // console.log(geoLocation)
        const {position, formattedAddress} = geoLocation;
        this.setState({
          region: {
            latitude: position.lat,
            longitude: position.lng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03
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

    _animateToLocation(coords) {
      this.refs.map.animateToCoordinate(coords);
    }

    _onRegionChangeComplete(region) {
      // console.log(region);
      this.setState({ region });
      this.props.changeLoc({
        lat: region.latitude,
        lon: region.longitude,
      })
    }

    // _zoom(bounds){
    //   this.refs.map.fitToCoordinates(bounds, {
    //     animated: true,
    //   })
    // }

    _animate(){
      this.mapHeight = this.state.focus ? 130 : screenWidth;
      Animated.timing(
        this.state.growAnim,
        {toValue: this.mapHeight}
      ).start();
      this.setState({ focus: !this.state.focus })
    }

    _zoom(z, e){
      e.stopPropagation();
      let upper = Object.assign({}, this.state.region);
      if(z==='-'){
        upper.latitudeDelta+=0.01;
        upper.longitudeDelta+= 0.01;
      } else {
        upper.latitudeDelta-=0.01;
        upper.longitudeDelta-= 0.01;
      }

      this.setState({
        region: upper,
      })
    }

  render(){
    // console.log(this.state);
    // console.log('props', this.props);
    let mapStyle = {flexGrow: 1, height: this.state.growAnim, backgroundColor: 'blue', justifyContent: 'center'}
    return(
      <Animated.View style={mapStyle}>
          <MapView
            ref='map'
            style={{height: screenWidth}}
            region={this.state.region}
            onRegionChangeComplete={this._onRegionChangeComplete.bind(this)}
            showsUserLocation={false}
            onPress={this._animate.bind(this)}
            >
          </MapView>
          <TouchableOpacity
            onPress={(this._zoom.bind(this, '+'))}
            style={{zIndex: 5, position: 'absolute', top: 0}}>
            <Text style={{fontSize: 20}}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(this._zoom.bind(this, '-'))}
            style={{zIndex: 5, position: 'absolute', top: 0, left: 10}}>
            <Text style={{fontSize: 20}}>-</Text>
          </TouchableOpacity>
      </Animated.View>
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
 };
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);
