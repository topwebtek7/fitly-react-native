/**
 * @flow
 */

export const SET_SIGNUP_METHOD = 'SET_SIGNUP_METHOD';
export const SET_SIGNIN_METHOD = 'SET_SIGNIN_METHOD';
export const RESET_AUTH_STATE = 'RESET_AUTH_STATE';
export const PRINT_AUTH_ERROR = 'PRINT_AUTH_ERROR';
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR';
export const SET_FIREBASE_UID = 'SET_FIREBASE_UID';
export const UPDATE_LOGIN_STATUS = 'UPDATE_LOGIN_STATUS';


export const setSignUpMethod = (method: string) => {
  return {
    type: SET_SIGNUP_METHOD,
    payload: method
  }
};

export const setSignInMethod = (method: string) => {
  return {
    type: SET_SIGNIN_METHOD,
    payload: method
  }
};

export const printAuthError = (errorMsg) => {
  return {
    type: PRINT_AUTH_ERROR,
    payload: errorMsg
  }
};

export const clearAuthError = () => {
  return {
    type: CLEAR_AUTH_ERROR
  }
};

export const resetAuthState = () => {
  return {
    type: RESET_AUTH_STATE,
  }
};

export const setFirebaseUID = (uID: string) => {
  return {
    type: SET_FIREBASE_UID,
    payload: uID
  }
};

export const updateLogginStatus = (boolean: boolean) => {
  return {
    type: UPDATE_LOGIN_STATUS,
    payload: boolean
  }
};
