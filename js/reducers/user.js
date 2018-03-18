import {
  STORE_USER_PROFILE,
  CLEAR_USER_PROFILE,
} from '../actions/user.js';

const initialState = {
  user: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case STORE_USER_PROFILE:

      return { ...state,
        user: action.payload
      };
    case CLEAR_USER_PROFILE:
      return { ...state,
        user: null
      };
    default:
    return state;
  }
};
