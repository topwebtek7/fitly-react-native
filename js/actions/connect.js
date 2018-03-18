/**
 * @flow
 */
 export const SET_ACTIVITY_LEVEL = 'SET_ACTIVITY_LEVEL';
 export const SET_WORKOUT_TYPE = 'SET_WORKOUT_TYPE';
 export const MATCH_USER = 'MATCH_USER';
 export const MATCH_SUCCEED = 'MATCH_SUCCEED';
 export const MATCH_FAILED = 'MATCH_FAILED';
 export const CANCEL_MATCH = 'CANCEL_MATCH';
 export const LOADING_ON = 'LOADING_ON';
 export const UPDATE_MATCH_STATUS = 'UPDATE_MATCH_STATUS';


export const setActivityLevel = (level: number) => {
  console.log('LELE', level)
  return {
    type: SET_ACTIVITY_LEVEL,
    payload: level
  }
};

export const setWorkoutType = (category: string) => {
  return {
    type: SET_WORKOUT_TYPE,
    payload: category
  }
};

export const matchUser = (matchService, onMatched):object => {
  return {
    type: MATCH_USER,
    matchService: matchService,
    onMatched: onMatched
  }
};

export const cancelMatch = (matchService):object => {
  return {
    type: CANCEL_MATCH,
    matchService: matchService
  }
};
