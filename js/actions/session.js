/**
 * @flow
 */
export const SESSION_LISTENER_ON = 'SESSION_LISTENER_ON';
export const SESSION_LISTENER_OFF = 'SESSION_LISTENER_OFF';
export const UPDATE_SESSION = 'UPDATE_SESSION';
export const CONFIRM_SESSION = 'CONFIRM_SESSION';
export const CANCEL_SESSION = 'CANCEL_SESSION';
export const SESSION_LOADING_ON = 'SESSION_LOADING_ON';
export const SESSION_UPDATE_SUCCEED = 'SESSION_UPDATE_SUCCEED';
export const SESSION_CANCELED = 'SESSION_CANCELED';

export const SESSION_CHAT_LISTENER_ON = 'SESSION_CHAT_LISTENER_ON';
export const SESSION_CHAT_LISTENER_OFF = 'SESSION_CHAT_LISTENER_OFF';
export const SEND_MSG = 'SEND_MSG';
export const NEW_MSG_RECIEVED = 'NEW_MSG_RECIEVED';
export const CLEAR_SESSION_STATE = 'CLEAR_SESSION_STATE';

export const GET_SESSION_BY_UID = 'GET_SESSION_BY_UID';
export const FETCH_SESSION_SUCCEED = 'FETCH_SESSION_SUCCEED';

export const sessionListenerOn = (session: object) => {
  return {
    type: SESSION_LISTENER_ON,
    session
  }
};

export const sessionListenerOff = (session: object) => {
  return {
    type: SESSION_LISTENER_OFF,
    session
  }
};

export const updateSession = (session: object, update: object) => {
  return {
    type: UPDATE_SESSION,
    session,
    update
  }
};

export const confirmSession = (session: object) => {
  return {
    type: CONFIRM_SESSION,
    session
  }
};

export const cancelSession = (session: object) => {
  return {
    type: CANCEL_SESSION,
    session
  }
};

export const sessionChatListenerOn = (session: object) => {
  return {
    type: SESSION_CHAT_LISTENER_ON,
    session
  }
};

export const sessionChatListenerOff = (session: object) => {
  return {
    type: SESSION_CHAT_LISTENER_OFF,
    session
  }
};

export const sendMsg = (session: object, message: object) => {
  return {
    type: SEND_MSG,
    session,
    message
  }
};

export const clearSessionState = () => {
  return {
    type: CLEAR_SESSION_STATE
  }
};

export const getSessionsByUID = (uid, size = 10, from = 0) => {
  return {
    type: GET_SESSION_BY_UID,
    uid,
    size,
    from
  }
};
