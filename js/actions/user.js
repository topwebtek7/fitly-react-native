/**
 * @flow
 */

export const STORE_USER_PROFILE = 'STORE_USER_PROFILE';
export const CLEAR_USER_PROFILE = 'CLEAR_USER_PROFILE';

export const storeUserProfile = (profile) => {
  return {
    type: STORE_USER_PROFILE,
    payload: profile
  }
};

export const clearUserProfile = () => {
  return {
    type: STORE_USER_PROFILE
  }
};
