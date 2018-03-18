import {
  SET_SIGNUP_METHOD,
  SET_SIGNIN_METHOD,
  RESET_AUTH_STATE,
  PRINT_AUTH_ERROR,
  CLEAR_AUTH_ERROR,
  SET_FIREBASE_UID,
  UPDATE_LOGIN_STATUS,
} from '../actions/auth.js';

const initialState = {
  signUpMethod: '',
  signInMethod: '',
  errorMsg: null,
  uID: null,
  isLoggedIn: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_SIGNUP_METHOD:
      return { ...state,
        signInMethod: action.payload,
        signUpMethod: action.payload,
        isLoggedIn: true
      };
    case SET_SIGNIN_METHOD:
      return { ...state,
        signInMethod: action.payload,
        isLoggedIn: true
      };
    case RESET_AUTH_STATE:
      return initialState;
    case PRINT_AUTH_ERROR:
    console.log('PRINT_AUTH_ERROR: ', action.payload);
      return { ...state,
        errorMsg: action.payload
      };
    case CLEAR_AUTH_ERROR:
      return { ...state,
        errorMsg: null
      };
    case SET_FIREBASE_UID:
      return { ...state,
        uID: action.payload
      };
    case UPDATE_LOGIN_STATUS:
      return { ...state,
        isLoggedIn: action.payload
      };
    default:
    return state;
  }
};
