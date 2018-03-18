import { combineReducers } from 'redux';
import user from './user.js';
import auth from './auth.js';
import app from './app.js';
import navState from './navState.js';
import drafts from './drafts.js';
import eventCalendar from './eventCalendar.js';
import connect from './connect.js';
import session from './session.js';
import blocks from './blocks.js';

const rootReducer = combineReducers({
  user,
  auth,
  app,
  navState,
  drafts,
  eventCalendar,
  connect,
  session,
  blocks,
})

export default rootReducer;
