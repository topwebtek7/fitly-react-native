import { FitlyFirebase } from './firebaseHelpers.js';
export const TIMEOUT = 180000 / 3;
export const RETRY_INTERVAL = 30000 / 3;
export const DEFAULT_RANGE = 24.1402;

type MatchReq = {
 profile: {
   "id": string,
   "picture": string,
   "last_name": string,
   "first_name": string,
   "activityLevel": number,
   "height": number,
   "weight": number,
   "workoutType": string,
   "currentLocation": {
     "lat": number,
     "lon": number,
   },
 },
 query: object,
 timestamp: number
};

export class MatchService {
  constructor(matchRequest: MatchReq) {
    this.matchRequest = matchRequest;
    this.waitingRoomRef = FitlyFirebase.database().ref('/waitingRoom/' + matchRequest.profile.id);
    this.matchedRef = FitlyFirebase.database().ref('/matchedUsers/');
    this.matchedRefSelf = this.matchedRef.child(matchRequest.profile.id);
  }

  async match(updateStatusCB = () => {return}, timeout = TIMEOUT) {
    await this.removeMatchResult();
    this.enterWaitingRm();
    return new Promise((resolve, reject) => {
      this.turnOnMatchListener((error, partnerProfile) => {
        if (error) {
          this.cancelMatch();
          reject(error);
        } else {
          resolve(partnerProfile);
          createSession(partnerProfile.sessionKey, this.matchRequest.profile.id, partnerProfile.id); //immediately create the session in database
        }
      }, updateStatusCB);
      this.matchTimemout = setTimeout(() => {
        let time = TIMEOUT / 60 / 1000 + 'min';
        reject(new Error(`match timeout after ${time}, try again later`));
        this.cancelMatch();
      }, timeout)
    })
  }

  cancelMatch() {
    if (this.matchTimemout) clearTimeout(this.matchTimemout);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.leaveWaitingRm();
    this.turnOffMatchListener();
  }

  enterWaitingRm() {
    this.waitingRoomRef.set(this.matchRequest);
  }

  leaveWaitingRm() {
    this.waitingRoomRef.remove();
  }

  turnOnMatchListener(handleMatchFound, updateStatus) {
    this.matchedRefSelf.on('value', snap => {
      if (snap.val() == null) return;
      const data = snap.val();
      if (data.error) handleMatchFound(new Error(data.error));
      this.leaveWaitingRm();
      this.signalMatch(data, handleMatchFound, updateStatus);
      updateStatus({partner: data.partnerProfile});
    })
  }

  signalMatch(otherUserData, handleMatchFound, updateStatus) {
    this.matchStatusRefOther = this.matchedRef.child(otherUserData.partnerProfile.id).child('matchStatus');
    this.matchStatusRefOther.on('value', (snap) => {
      if (snap.val() == null) return;
      if (snap.val() === false) {
        this.matchStatusRefOther.off('value');
        this.matchStatusRefOther.set(true);
        this.confirmMatch(otherUserData, handleMatchFound, updateStatus);
      }
    }, (error) => {
      console.log('other user is not matched with you', error);
      this.matchStatusRefOther.off('value');
      this.retryMatch(updateStatus);
    })
  }

  confirmMatch(matchData, onSuccess, onStatusUpdate) {
    this.matchStatusRefSelf = this.matchedRefSelf.child('matchStatus');
    this.matchStatusRefSelf.on('value', snap => {
      if (snap.val() == null || snap.val() === false) {
        this.retryMatch(onStatusUpdate);
      } else {
        this.matchStatusRefSelf.off('value');
        onSuccess(null, matchData.partnerProfile);

        this.turnOffMatchListener();
        if (this.matchTimemout) clearTimeout(this.matchTimemout);
        if (this.retryTimer) clearTimeout(this.retryTimer);
      }
    });
  }

  removeMatchResult() {
    return this.matchedRefSelf.remove();
  }

  retryMatch(updateStatus) {
    this.retryTimer = setTimeout(async () => {
      console.log('re enter waitingRoom');
      updateStatus({partner: null});
      if (this.matchStatusRefSelf) {this.matchStatusRefSelf.off('value')};
      await this.removeMatchResult();
      this.enterWaitingRm();
    }, RETRY_INTERVAL)
  }

  turnOffMatchListener() {
    this.matchedRefSelf.off('value');
    this.matchedRefSelf.child('matchStatus').off('value');
    if (this.matchStatusRefOther) this.matchStatusRefOther.off('value');
  }
};


export const createReqObj = ({user, activityLevel, userid, workoutType}) => {
  return {
    profile: {
      id: userid,
      picture: user.public.picture,
      last_name: user.public.last_name,
      first_name: user.public.first_name,
      activityLevel: activityLevel,
      height: user.private.height,
      weight: user.private.weight,
      workoutType: workoutType,
      currentLocation: user.public.userCurrentLocation.coordinate,
    },
    query: buildQuery({userid, location: user.public.userCurrentLocation.coordinate, activityLevel, workoutType}),
    timestamp: Date.now()
  }
}

const buildQuery = ({userid, workoutType, location, activityLevel, range = DEFAULT_RANGE}) => {
  const queryBody = {
    sort: [
      {
        "_geo_distance" : {
          "currentLocation" : location,
          "order" : "asc",
          "unit" : "km",
          "distance_type" : "plane"
        }
      },
      "_score"
    ],
    query : {
      filtered: {
        filter: {
          bool: {
            must_not: {
              term: {id: userid}
            },
            must: [
              {
                term: {
                  workoutType: workoutType
                }
              },
              {
                range: {
                  activityLevel: {
                    gte: activityLevel - 1,
                    lte: activityLevel + 1,
                  }
                }
              },
            ],
            filter: {
              geo_distance: {
                distance: range + 'km',
                'currentLocation': location
              }
            }
          }
        }
      }
    }
  };
  let fetchSize = 5;
  return {
    index: 'waitingroom',
    type: 'waitingroom',
    size: fetchSize,
    from: 0,
    body: JSON.stringify(queryBody) //because there is '.' in the object, it cannot be a valid json, therefore must first be stringify, see: https://github.com/firebase/flashlight/issues/91
  };
}

export const createSession = (sessionID, id1, id2) => {
  const members = {
    [id1]: true,
    [id2]: true
  }
  const updateObj = {
    ['/workoutSessions/' + sessionID]: {
      members,
      "confirmation": {
        [id1]: false,
        [id2]: false
      }
    },
    ['/sessionChat/' + sessionID]: {
      members
    }
  };
  FitlyFirebase.database().ref().update(updateObj)
  .catch(err => console.log(err));
};
