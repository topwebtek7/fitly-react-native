/**
 * @flow
 */

export const PUSH_ROUTE = 'PUSH_ROUTE';
export const POP_ROUTE = 'POP_ROUTE';
export const SELECT_TAB = 'SELECT_TAB';
export const RESET_TO = 'RESET_TO';
export const MOVE_BACK = 'MOVE_BACK';
export const MOVE_FORWARD = 'MOVE_FORWARD';
export const CLEAR_LOCAL_NAV_STATE = 'CLEAR_LOCAL_NAV_STATE';
export const REPLACE_ROUTES = 'REPLACE_ROUTES';

export const push = (route: object, option = {general: false}) => {
  //navigator forbid key duplications for push, thus we need to create unique keys unless specified
  if (option.general) {
    let routeCopy = Object.assign({}, route);
    routeCopy.key = routeCopy.key + Date.now();
    return {
      type: PUSH_ROUTE,
      route: routeCopy
    }
  }
  return {
    type: PUSH_ROUTE,
    route: route
  }
};

export const pop = (route: object) => {
  return {
    type: POP_ROUTE,
    route: route
  }
};

export const selectTab = (tabIndex: number) => {
  return {
    type: SELECT_TAB,
    tabIndex: tabIndex
  }
};

export const resetTo = (route: object) => {
  return {
    type: RESET_TO,
    route: route
  }
};

export const moveBack = () => {
  return {
    type: MOVE_BACK,
  }
};

export const moveForward = () => {
  return {
    type: MOVE_FORWARD,
  }
};

export const clearLocalNavState = () => {
  return {
    type: CLEAR_LOCAL_NAV_STATE
  }
};

export const replaceRoutes = (size: number, route: object) => {
  return {
    type: REPLACE_ROUTES,
    size: size,
    route: route
  }
};
