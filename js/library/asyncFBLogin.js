import { FBLoginManager } from 'react-native-facebook-login';
import { Platform } from 'react-native';

if(Platform.OS === 'android') {
  FBLoginManager.setLoginBehavior(FBLoginManager.LoginBehaviors.Web);
}


export const asyncFBLogout = () => {
  return new Promise((resolve, reject) => {
    FBLoginManager.logout((error, data) => {
      if (!error) {
        resolve(data);
      } else {
        reject(error);
      }
    })
  })
};

export const asyncFBLoginWithPermission = (permissions: array) => {
  return new Promise((resolve, reject) => {
    FBLoginManager.loginWithPermissions(permissions, (error, data) => {
      if (!error) {
        resolve(data);
      } else {
        console.log('there was en error!', error)
        reject(error);
      }
    })
  })
};

export const fetchFBProfile = (token: string) => {
  // console.log('fetchFBProfile', token);
  return fetch('https://graph.facebook.com/v2.8/me?fields=email,name,friends,first_name,last_name,picture,gender,birthday,location&access_token=' + token)
  .then((response) => {
    return response.json()
  })
  .catch(error => console.log('unable to get facebook profile, try again later', error))
};
