/**
 * @flow
 */

import { AppRegistry } from 'react-native';
import Fitly from './js/setup.js';

//this line disables the yellow warning boxes
console.disableYellowBox = true;

AppRegistry.registerComponent('Fitly', Fitly);
