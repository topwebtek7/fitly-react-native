import { call, put, takeEvery } from 'redux-saga/effects';
import {
  SESSION_LISTENER_ON,
  SESSION_LISTENER_OFF,
  UPDATE_SESSION,
  CANCEL_SESSION,
  SESSION_LOADING_ON,
  SESSION_UPDATE_SUCCEED,
  SESSION_CANCELED,
  NEW_MSG_RECIEVED,
  SEND_MSG,
  SESSION_CHAT_LISTENER_ON,
  SESSION_CHAT_LISTENER_OFF,
  GET_SESSION_BY_UID,
  FETCH_SESSION_SUCCEED
} from '../actions/session.js';
import { getSessionsByUID } from '../services/SessionService';

function* sessionListenerOn(dispatch, {session, cancelCB}) {
  yield put({type: SESSION_LOADING_ON});
  yield call([session, session.listenerOn],
    (data) => onUpdate(dispatch, data),
    (subject) => onCanceled(dispatch, subject, cancelCB)
  );
};

function onUpdate(dispatch, data) {
  dispatch({type: SESSION_UPDATE_SUCCEED, payload: data});
};

function onCanceled(dispatch, subject) {
  dispatch({type: SESSION_CANCELED, payload: subject});
};

function* sessionListenerOff({session}) {
  yield call([session, session.listenerOff]);
};

function* updateSession({session, update}) {
  yield call([session, session.update], update);
};

function* cancelSession(dispatch, {session}) {
  yield call([session, session.cancel]);
  yield call(onCanceled, dispatch, 'self');
};

function* sessionChatListenerOn(dispatch, {session}) {
  yield call([session, session.chatListenerOn], (msgs) => handleNewMsg(dispatch, msgs));
};

function* sessionChatListenerOff({session}) {
  yield call([session, session.chatListenerOff]);
};

function handleNewMsg(dispatch, msgs) {
  dispatch({type: NEW_MSG_RECIEVED, payload: msgs});
}

function* sendMsg({session, message}) {
  yield call([session, session.sendMsg], message);
};

function* getSessions({uid, size, from}) {
  try {
    const sessionData = yield call(getSessionsByUID, uid, size, from);
    yield put({type: FETCH_SESSION_SUCCEED, payload: sessionData});
  } catch (error) {
    console.log(error);
  }
};

export default function* sessionSaga(dispatch) {
  yield [
    takeEvery(SESSION_LISTENER_ON, sessionListenerOn, dispatch),
    takeEvery(SESSION_LISTENER_OFF, sessionListenerOff),
    takeEvery(SESSION_CHAT_LISTENER_ON, sessionChatListenerOn, dispatch),
    takeEvery(SESSION_CHAT_LISTENER_OFF, sessionChatListenerOff),
    takeEvery(CANCEL_SESSION, cancelSession, dispatch),
    takeEvery(UPDATE_SESSION, updateSession),
    takeEvery(SEND_MSG, sendMsg),
    takeEvery(GET_SESSION_BY_UID, getSessions),
  ]
}
