/**
 * @flow
 */

export const SET_CURRENT_PAGE = 'SET_CURRENT_PAGE';
export const SET_CALENDAR_STATE = 'SET_CALENDAR_STATE';

export const setCurrentPage = (index: number) => {
  return {
    type: SET_CURRENT_PAGE,
    payload: index
  }
};

export const setCalendarState = (state: object) => {
  return {
    type: SET_CALENDAR_STATE,
    payload: state
  }
};
