import { fork } from 'redux-saga/effects';
import matchSaga from './matchSaga';
import sessionSaga from './sessionSaga';

export default function* rootSaga(dispatch) {
  yield [
    fork(matchSaga),
    fork(sessionSaga, dispatch)
  ]
}
