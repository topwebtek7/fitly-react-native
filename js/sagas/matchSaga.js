import { call, put, takeEvery } from 'redux-saga/effects';
import {
  MATCH_USER,
  CANCEL_MATCH,
  MATCH_SUCCEED,
  MATCH_FAILED,
  LOADING_ON,
  UPDATE_MATCH_STATUS
} from '../actions/connect.js';

function* matchUser({matchService, onMatched}) {
   try {
      yield put({type: LOADING_ON});
      const partnerData = yield call([matchService, matchService.match], foundPotentialMatch);
      onMatched();
      yield put({type: MATCH_SUCCEED, payload: partnerData});
      //push to a direct msg view after 3 seconds
   } catch (error) {
      console.log(error);
      yield put({type: MATCH_FAILED, error});
   }
};

function* cancelMatch({matchService}) {
    yield call([matchService, matchService.cancelMatch]);
    yield put({type: MATCH_FAILED, error: new Error('match canceled')});
};

function* rematch() {
  yield put({type: LOADING_ON});
};

function* foundPotentialMatch(otherUser) {
  yield put({type: UPDATE_MATCH_STATUS, partner: otherUser});
};

export default function* matchSaga() {
  yield takeEvery(MATCH_USER, matchUser);
  yield takeEvery(CANCEL_MATCH, cancelMatch);
}
