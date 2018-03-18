/**
 * @flow
 */
import {
  PUSH_ROUTE,
  POP_ROUTE,
  SELECT_TAB,
  RESET_TO,
  MOVE_BACK,
  MOVE_FORWARD,
  CLEAR_LOCAL_NAV_STATE,
  REPLACE_ROUTES
} from '../actions/navigation.js';
import { NavigationExperimental } from 'react-native';
const { StateUtils } = NavigationExperimental;

// Place holder for change.
// routes: [{key: 'WelcomeView', global: true}]
//

const initialState: State = {
  global: {
    index: 0,
    routes: [{key: 'SignInView', global: true}]
  },

  tabs: {
    index: 2,
    routes: [
      {key: 'Activity'},
      {key: 'Search'},
      {key: 'Profile'},
      {key: 'Notification'},
      {key: 'Connect'}
    ]
  },

  Activity: {
    index: 0,
    routes: [{key: 'Activity', global: false}]
  },
  Search: {
    index: 0,
    routes: [{key: 'Search', showHeader: true, global: false}]
  },
  Profile: {
    index: 0,
    routes: [{key: 'Profile', showHeader: true, global: false}]
  },
  Notification: {
    index: 0,
    routes: [{key: 'Notification', showHeader: true, global: false}]
  },
  Connect: {
    index: 0,
    routes: [{key: 'Connect', showHeader: true, global: false}]
  },
};

export default function (state: State = initialState, action): State {
  let {type} = action;
  switch (type) {

    case PUSH_ROUTE: {
      let {route} = action;
      if (route.global) {
        const scenes = state.global;
        const nextScenes = StateUtils.push(scenes, route);
        if (scenes !== nextScenes) {
          return {
            ...state,
            global: nextScenes
          };
        }
      } else {
        const {tabs} = state;
        const tabKey = tabs.routes[tabs.index].key;
        const scenes = state[tabKey];
        const nextScenes = StateUtils.push(scenes, route);
        if (scenes !== nextScenes) {
          return {
            ...state,
            [tabKey]: nextScenes
          };
        }
      }
      break;
    }

    case POP_ROUTE: {
      let {route} = action;
      if (!route || route.global) {
        const scenes = state.global;
        const nextScenes = StateUtils.pop(scenes);
        if (scenes !== nextScenes) {
          return {
            ...state,
            global: nextScenes
          };
        }
      } else {
        const {tabs} = state;
        const tabKey = tabs.routes[tabs.index].key;
        const scenes = state[tabKey];
        const nextScenes = StateUtils.pop(scenes);
        if (scenes !== nextScenes) {
          return {
            ...state,
            [tabKey]: nextScenes
          };
        }
      }
      break;
    }

    case SELECT_TAB: {
      const {tabIndex} = action;
      if (tabIndex !== state.tabs.index) {
        return {
          ...state,
          tabs: StateUtils.jumpToIndex(state.tabs, tabIndex)
        };
      } else {
        const {tabs} = state;
        const tabKey = tabs.routes[tabIndex].key;
        const scenes = state[tabKey];
        const nextScenes = initialState[tabKey];
        if (scenes !== nextScenes) {
          return {
            ...state,
            [tabKey]: nextScenes
          };
        }
      }
      break;
    }

    case RESET_TO: {
      let {route} = action;
      if (route.global) {
        const scenes = state.global;
        const nextScenes = StateUtils.reset(scenes, [route], 0);
        if (scenes !== nextScenes) {
          return {
            ...state,
            global: nextScenes
          };
        }
      } else {
        const {tabs} = state;
        const tabKey = tabs.routes[tabs.index].key;
        const scenes = state[tabKey];
        const nextScenes = StateUtils.reset(scenes, [route], 0);
        if (scenes !== nextScenes) {
          return {
            ...state,
            [tabKey]: nextScenes
          };
        }
      }
      break;
    }

    case CLEAR_LOCAL_NAV_STATE: {
      return initialState;
      break;
    }

    case REPLACE_ROUTES: {
      let {size, route} = action;
      const scenes = state.global;
      if (route.global) {
        if (scenes.routes.length < size) return state;
        const nextScenes = {
          index: scenes.index - size + 1,
          routes: scenes.routes.slice(0, scenes.routes.length - size).concat([route])
        }
        if (scenes !== nextScenes) {
          return {
            ...state,
            global: nextScenes
          };
        }
      } else {
        const {tabs} = state;
        const tabKey = tabs.routes[tabs.index].key;
        const scenes = state[tabKey];
        if (scenes.routes.length < size) return state;
        const nextScenes = {
          index: scenes.index - size + 1,
          routes: scenes.routes.slice(0, scenes.routes.length - size).concat([route])
        }
        if (scenes !== nextScenes) {
          return {
            ...state,
            [tabKey]: nextScenes
          };
        }
      }
      break;
    }
  }

  return state;
};
