import {
  SET_ACTIVITY_LEVEL,
  SET_WORKOUT_TYPE,
  MATCH_SUCCEED,
  MATCH_FAILED,
  LOADING_ON,
  UPDATE_MATCH_STATUS,
} from '../actions/connect.js';

const initialState = {
  activityLevel: 0,
  workoutType: '',
  matching: true,
  matched: false,
  partner: null,
  error: null,
  progress: 0,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVITY_LEVEL:
      return { ...state,
        activityLevel: action.payload
      };
    case SET_WORKOUT_TYPE:
      return { ...state,
        workoutType: action.payload
      };
    case MATCH_SUCCEED:
      return { ...state,
        partner: action.payload,
        matched: true,
        matching: false,
      };
    case MATCH_FAILED:
      return { ...state,
        error: action.error.message,
        matched: false,
        matching: false,
      };
    case LOADING_ON:
      return { ...state,
        error: null,
        matched: false,
        matching: true,
        partner: null,
      };
    case LOADING_ON:
      return { ...state,
        error: null,
        matched: false,
        matching: true,
        partner: null,
      };
    case UPDATE_MATCH_STATUS:
      return { ...state,
        ...action.payload
      };
    default:
    return state;
  }
};
