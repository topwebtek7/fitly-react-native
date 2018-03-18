import Geocoder from 'react-native-geocoder';
import { Platform } from 'react-native';

// fall back to google in case something happens, need google api key
import { GEOCODING_API_KEY } from '../../credentials/GOOGLE_PLACE_API_KEY.js';

Geocoder.fallbackToGoogle(GEOCODING_API_KEY);

const isAndroid = Platform.OS === 'android';

const getCurrentPositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
};

if (!isAndroid) {
  getCurrentPositionOptions.maximumAge = 1000;
}

export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      location => {
        resolve(location);
      },
      error => reject(error),
      getCurrentPositionOptions
    );
  });

export const getCurrentPlace = () =>
  getCurrentPosition()
    .then(({ coords }) => Geocoder.geocodePosition({lat: coords.latitude, lng: coords.longitude}))
    .then(geocoding => geocoding[0]).catch(error => {
      console.log('geocoding getCurrentPlace error', error);
    });

export const getPlaceByName = userInput =>
  Geocoder.geocodeAddress(userInput)
    .then(geocoding => geocoding[0]).catch(error => {
      console.log('geocoding getPlaceByName error', error);
    });

export const getPlaceByCoord = coord =>
  Geocoder.geocodePosition(coord)
    .then(geocoding => geocoding[0]).catch(error => {
      console.log('geocoding getPlaceByCoord error', error);
    });

export const getPlaceByCoordGoogle = coord =>
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.lat},${coord.lng}&key=${GEOCODING_API_KEY}`
  )
    .then(data => data.json())
    .catch(error => console.log(error));
