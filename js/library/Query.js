import { FitlyFirebase } from './firebaseHelpers';

export default class Query {
  constructor(type, id = null, index = 'firebase') {
    this.type = type;
    this.index = index;
    this.userid = id;
  }

  clearCache(){
      const queryBody = {
        _cache: 'clear'
      }
      return this.search(queryBody)
  }

  searchByLocation(fieldName, coord, radius = 24, page = 0, size = 10) {
    const queryBody = {
      sort: [
        {
          "_geo_distance" : {
            [fieldName] : coord,
            "order" : "asc",
            "unit" : "km",
            "distance_type" : "plane"
          }
        },
        "_score"
      ],
      query: {
        filtered: {
          filter: {
            bool: {
              filter: {
                geo_distance: {
                  distance: radius + 'km',
                  [fieldName]: coord
                }
              }
            }
          }
        }
      }
    }
    return this.search(queryBody, page, size);
  }

  searchTrainers(fieldName, coord, radius = 24, page = 0, size = 10) {
    const queryBody = {
      sort: [
        {
          "_geo_distance" : {
            [fieldName] : coord,
            "order" : "asc",
            "unit" : "km",
            "distance_type" : "plane"
          }
        },
        "_score"
      ],
      query: {
        filtered: {
          filter: {
            bool: {
              must_not: {
                term: {_id: this.userid || 'null'}
              },
              filter: {
                geo_distance: {
                  distance: radius + 'km',
                  [fieldName]: coord
                }
              },
              must: [
                {
                  term: {
                    account: 'trainer'
                  }
                }
              ]
            }
          }
        }
      }
    }
    return this.search(queryBody, page, size);
  }

  searchByInput(fieldName, input, page = 0, size = 10) {
    const queryBody = {
      sort: [
        "_score"
      ],
      query : {
            bool: {
              must_not: {
                term: {_id: this.userid || 'null'}
              },
              should: [
                {
                    wildcard: {
                      [fieldName]: '*' + input.toLowerCase() + '*'
                    }
                },
                {
                    wildcard: {
                      [fieldName]: '*' + input + '*'
                    }
                },
                {
                    prefix: {
                      [fieldName]: {value: input, boost: 2.0}
                    }
                }
              ]
            }
      }
    }
    return this.search(queryBody, page, size);
  }

  advancedEventSearch(input, settings, page = 0, size = 10){
    const queryBody = {
      sort: [
        {
          startDate: {
            "order": "asc"
          }
        },
        {
          "_geo_distance" : {
            'location.coordinate': settings.coord,
            "order" : "asc",
            "unit" : "km",
            "distance_type" : "plane"
          }
        },
        "_score"
      ],
      query : {
              and: [
                {
                  range: {
                    startDate: {
                      gte: settings.fromTime,
                      lte: settings.toTime
                    }
                  }
                },
                {
                  query: {
                    bool:{
                      should:[
                        {
                          wildcard: {
                            title: '*' + input.toLowerCase() + '*'
                          }
                        },
                        {
                          prefix:{
                            title: input,
                          }
                        },
                      ]
                    }
                  },
                },
                {
                  query: {
                    geo_distance: {
                      distance: (settings.distance*8/5) + 'km',
                      'location.coordinate': settings.coord
                    }
                  }
                },
                {
                  query: {
                    constant_score : {
                      filter : {
                        terms : {
                          category : [...settings.category]
                        }
                      }
                    }
                  }
                },
              ]
      }
    }
    return this.search(queryBody, page, size);
  }

  search(queryBody, page = 0, size = 10) {
    let fetchSize = 10;
    const query = {
      index: this.index,
      type: this.type,
      size: size,
      from: page * size,
      body: JSON.stringify(queryBody) //because there is '.' in the object, it cannot be a valid json, therefore must first be stringify, see: https://github.com/firebase/flashlight/issues/91
    };
    // console.log(query);
    return new Promise((resolve, reject) => {
      const key = FitlyFirebase.database().ref('/search/request').push(query).key;
      FitlyFirebase.database().ref('/search/response/' + key).on('value', showResults.bind(this));
      function showResults(snap) {
        if (!snap.exists()) { return; }
        snap.ref.off('value', showResults);
        // console.log(snap.val());
        snap.ref.remove();
        const results = snap.val().hits;
        if (!results || !results.hits) {
          reject(new Error('No match found'));
        } else {
          resolve(results.hits);
        }
      }
    })
  }
}
