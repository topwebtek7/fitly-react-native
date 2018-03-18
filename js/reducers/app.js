import { SET_LOADING_STATE, PRINT_ERROR, CLEAR_ERROR, SET_SEARCH_LOCATION } from '../actions/app.js';
import {FitlyFirebase} from '../library/firebaseHelpers.js';

const initialState = {
  loading: false,
  error: null,
  searchLocation: {
    coordinate: {
      lat: 37.78825,
      lon: -122.4324,
    },
    address: null,
    placeName: 'current location',
    //radius: 24000
    radius: 48000
  },
  FitlyFirebase: FitlyFirebase
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_SEARCH_LOCATION:
      return { ...state,
        searchLocation: {
          ...state.searchLocation,
          ...action.payload
        },
      };
    case SET_LOADING_STATE:
      return { ...state,
        loading: action.payload,
      };
    case PRINT_ERROR:
      console.log('PRINT_ERROR: ', action.payload);
      return { ...state,
        error: action.payload,
      };
    case CLEAR_ERROR:
      return { ...state,
        error: null,
      };
    default:
    return state;
  }
};
