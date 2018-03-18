import { SET_CURRENT_PAGE, SET_CALENDAR_STATE } from '../actions/eventCalendar.js';

const initialState = {
  index: 0,
  routes: [
    { key: '0' },
    { key: '1' },
  ],
};

export default function (state: object = initialState, action: object): object {
  switch (action.type) {
    case SET_CURRENT_PAGE:
      const index = action.payload;
      return {
        index: index,
        routes: state.routes.slice(0, index + 1).concat([{key: (index + 1).toString()}])
      };
    case SET_CALENDAR_STATE:
      return {
        ...action.payload
      };
    default:
    return state;
  }
};
