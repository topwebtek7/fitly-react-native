var {GooglePlacesAutocomplete} = require('react-native-google-places-autocomplete');
import React, { Component } from 'react';
import PLACE_API_KEY from '../../credentials/GOOGLE_PLACE_API_KEY.js';

export default PlaceSearchBox = (props) => {
  return <GooglePlacesAutocomplete
    placeholder='Search'
    minLength={2} // minimum length of text to search
    autoFocus={false}
    listViewDisplayed='auto'    // true/false/undefined
    fetchDetails={true}
    // renderDescription={(row) => row.terms[0].value} // display street only
    onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
      props.onPress(data, details);
    }}
    getDefaultValue={(text) => {
      // this.props.getDefaultValue(text);
    }}
    query={{
      // available options: https://developers.google.com/places/web-service/autocomplete
      key: PLACE_API_KEY,
      language: 'en', // language of the results
      // types: '(cities)', // default: 'geocode'
    }}
    styles={{
      description: {
        fontWeight: 'bold',
      },
      predefinedPlacesDescription: {
        color: '#1faadb',
      },
      powered: {
        width: null,
        height: null,
      },
      poweredContainer: {
        height: 0,
        margin: 0,
        padding: 0
      },
    }}

    // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
    currentLocationLabel="Current location"
    nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
    GoogleReverseGeocodingQuery={{
      // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
    }}
    GooglePlacesSearchQuery={{
      // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
      rankby: 'distance',
      types: 'food',
    }}


    filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

  />
}
