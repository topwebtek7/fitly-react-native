import {
  SESSION_UPDATE_SUCCEED,
  SESSION_CANCELED,
  NEW_MSG_RECIEVED,
  CLEAR_SESSION_STATE,
  FETCH_SESSION_SUCCEED,
} from '../actions/session.js';

const initialState = {
  session: null,
  chatMsgs: [],
  loading: true,
  canceled: false,
  sessions: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SESSION_UPDATE_SUCCEED:
      return { ...state,
        loading: false,
        session: action.payload
      };
    case SESSION_CANCELED:
      return { ...state,
        canceled: action.payload
      };
    case NEW_MSG_RECIEVED:
      return { ...state,
        chatMsgs: state.chatMsgs.concat(action.payload),
      };
    case FETCH_SESSION_SUCCEED:
      return { ...state,
        sessions: action.payload
      };
    case CLEAR_SESSION_STATE:
      return initialState;
    default:
    return state;
  }
};
