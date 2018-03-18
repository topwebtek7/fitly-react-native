import { FitlyFirebase, createDeepUpdateObj, turnOnCommentListener } from '../library/firebaseHelpers.js';
let db = FitlyFirebase.database();

export class SessionService {
  constructor(sessionID) {
    this.sessionID = sessionID;
    this.sessionRef = db.ref('workoutSessions').child(sessionID);
    this.sessionChatRef = db.ref('sessionChat').child(sessionID);
    this.dmRef = this.sessionChatRef.child('directMsgs');
  }

  listenerOn(onUpdate, onCanceled) {
    this.sessionRef.on('value', (snap) => onUpdate(snap.val()));
    this.sessionRef.child('canceled').on('value', (snap) => {
      if (snap.val() == null) return;
      if (!this.intiatedCancelation) {
        this.listenerOff();
        this.chatListenerOff();
        this.removeSession();
      }
      onCanceled('partner');
    });
  }

  listenerOff() {
    this.sessionRef.off('value');
    this.sessionRef.child('canceled').off('value');
  }

  update(updateObj) {
    return this.sessionRef.update(createDeepUpdateObj(updateObj));
  }

  removeSession() {
    console.log('session removed');
    this.sessionRef.remove();
    this.sessionChatRef.remove();
  }

  cancel() {
    this.intiatedCancelation = true;
    this.sessionRef.child('canceled').set(true)
    this.listenerOff();
    this.chatListenerOff();
  }

  chatListenerOn(onUpdate) {
    this.dmRef.orderByChild('createdAt').once('value')
    .then(msgsSnap => {
      if (msgsSnap.val() == null) return;
      let msgs = [];
      msgsSnap.forEach(msgSnap => {
        msgs.push(msgSnap.val());
      })
      onUpdate(msgs);
    }).catch(error => console.log(error));

    const handleNewMsg = (msgSnap) => {
      if (msgSnap.val() == null) return;
      onUpdate([msgSnap.val()]);
    };

    this.dmRef.orderByChild('createdAt').startAt(Date.now()).on('child_added', handleNewMsg);
  }

  chatListenerOff() {
    this.dmRef.off('value');
  }

  sendMsg(msgs) {
    let msg = msgs[msgs.length - 1];
    const msgKey = this.dmRef.push().key;
    msg.createdAt = msg.createdAt.getTime();
    msg._id = msgKey;
    this.dmRef.child(msgKey).set(msg);
  }

  onConfirmed(uid1, user2, sessionDate) {
    this.addUserSessionCount(uid1);
    this.addUserWorkoutSessions(uid1, user2, sessionDate);
    this.addWorkoutPartner(uid1, user2, sessionDate);
  }

  addUserSessionCount(uid) {
    db.ref('/users/' + uid + '/public/sessionCount').transaction(count => count + 1);
  }

  addUserWorkoutSessions(uid, user2, sessionDate) {
    db.ref('userWorkOutSessions' + '/' + uid + '/' + this.sessionID).set({
      partner: user2,
      timestamp: sessionDate
    })
  }

  addWorkoutPartner(uid1, user2, sessionDate) {
    let partnerRef = db.ref('userWorkOutPartners').child(uid1).child(user2.id);
    partnerRef.child('lastConnected').set(new Date().getTime());
    partnerRef.child('sessions').child(this.sessionID).set({timestamp: sessionDate});
  }
}

export const getSessionsByUID = (uid, size, from) => {
  return db.ref('userWorkOutSessions').child(uid).orderByChild('timestamp').once('value')
    .then((sessionsSnap) => {
      let sessions = [];
      sessionsSnap.forEach(sessionSnap => {
        sessions.push({
          id: sessionSnap.key,
          ...sessionSnap.val()
        })
      });
      console.log(sessions);
      return sessions;
    })
    .catch(error => {
      console.log('fetch sessions failed', error)
    })
}
