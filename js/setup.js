/**
 * @flow
 */

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configStore from './store/configStore.js';
import { StatusBar } from 'react-native';
import FitlyApp from './FitlyApp.js';
const store = configStore();
function setup() {
  class Root extends React.Component {
    render() {
      StatusBar.setBarStyle('light-content');
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('#000045');
      return (
        <Provider store={store}>
          <FitlyApp />
        </Provider>
      );
    }
  }
  return Root;
}

export default setup;
