import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  Animated,
  Dimensions,
  InteractionManager,
  Platform
} from 'react-native';
import { commonStyle } from '../../styles/styles.js';
import { push, pop } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UserSearchResults from './UserSearchResults.js';
import HeaderInView from '../../header/HeaderInView.js';
import UserSearchResultEntry from './UserSearchResultEntry';

import SearchBar from 'react-native-search-box';
import Query from '../../library/Query';
import { saveTags } from '../../library/firebaseHelpers';

import LocalPosts from './LocalPosts';
import LocalPeople from './LocalPeople';
import LocalTrainers from './LocalTrainers';
import Trending from './Trending';
import Map from './Map';
import SearchResults from './SearchResults';
import SearchTabs from './SearchTabs';
import { postCategories, eventCategories } from '../../constants/categories';
import FAIcons from 'react-native-vector-icons/FontAwesome';
// Navigation Screens
import ProfileEntry from '../../common/ProfileEntry';
import PostImagesView from '../../common/PostImagesView';
import PostView from '../../common/post/PostView';
import ImageView from '../../common/ImageView';
import TaggedView from '../../common/TaggedView';
import EventScene from '../../common/activity/EventScene';

const isAndroid = Platform.OS === 'android';

import { StackNavigator, NavigationActions } from 'react-navigation';
import commingSoon from '../../common/commingSoon';

const screenWidth = Dimensions.get('window').width;

const defaultEventSettings = {
  distance: 30,
  fromTime: null,
  toTime: null,
  category: eventCategories
};

const defaultPostSettings = {
  fromTime: null,
  toTime: null,
  category: postCategories
};

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searching: 'posts',
      loc: {
        lat: 37.78825,
        lon: -122.4324
      },
      radius: 5,
      focus: false,
      searchMode: false,
      growAnim: new Animated.Value(screenWidth),
      trending: { trending: [], loading: true, viewing: 'Trending' },
      content: { content: [], loading: true, exploring: 'Posts' },
      localPeople: {
        localPeople: [],
        page: 0,
        reachedEnd: false,
        loading: true
      },
      latestPosts: {},
      latestPostsCount: 9,
      latestPostsEnd: false,
      searchResults: {
        q: '',
        top: { users: [], posts: [], events: [], lastQ: '' },
        users: { users: [], lastQ: '', page: 0, endReached: false },
        posts: { posts: [], lastQ: '', page: 0, endReached: false },
        events: { events: [], lastQ: '', page: 0, endReached: false },
        tags: { tags: [], lastQ: '' },
        searching: false
      },
      top: {
        users: { page: 0, endReached: false },
        posts: { page: 0, endReached: false },
        events: { page: 0, endReached: false }
      },
      text: '',
      activeTab: 'top',
      searchSettings: {
        ...defaultEventSettings,
        coord: this.props.user.public.userCurrentLocation.coordinate
      }
    };
    this.flexSize = 1;
    this.userQuery = new Query('user', this.props.uID);
    this.postQuery = new Query('post', this.props.uID);
    this.eventQuery = new Query('event', this.props.uID);
    this.tagQuery = new Query('tag', this.props.uID);
    this.doneTypingInterval = 500;
    this.typingTimer;
    this.fireData = this.props.FitlyFirebase.database();
    this.blocks = this.props.blocks;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._getLocalTrainers();
      // this._setTrendingTags();
      this._setLatestPosts();
    });
  }
  // componentWillReceiveProps(nextProps) {
  //   if(nextProps.tabState.index === 1 && !this.state.focus) this.setState({focus: true})
  //   if(nextProps.tabState.index !== 1 && this.state.trending.trending !== [] && this.props.user){
  //     InteractionManager.runAfterInteractions(()=>{
  //       // this._setTrendingTags();
  //       this.setState({
  //         content: {
  //           ...this.state.content,
  //           exploring: 'Posts'
  //         }
  //       })
  //     })
  //   }
  // }

  _getLocalPeople() {
    this.setState({
      localPeople: {
        ...this.state.localPeople,
        loading: true
      }
    });
    const page = this.state.localPeople.page;
    const { coordinate } = this.props.user.public.userCurrentLocation;
    this.userQuery
      .searchByLocation(
        'userCurrentLocation.coordinate',
        coordinate,
        this.state.radius * 8 / 5,
        page
      )
      .then(results => {
        const people = this.state.localPeople.localPeople;
        for (const user of results) {
          const id = { id: user._id };
          if (this.blocks[user._id]) continue;
          people.push(Object.assign({}, user._source, id));
        }
        let reachedEnd = false;
        if (results.length < 10) reachedEnd = true;
        this.setState({
          localPeople: {
            localPeople: people,
            page: page + 1,
            reachedEnd,
            loading: false
          }
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          localPeople: {
            ...this.state.localPeople,
            reachedEnd: true,
            loading: false
          }
        });
        this._updateData([]);
      });
  }

  _getLocalTrainers() {
    this.setState({
      localPeople: {
        ...this.state.localPeople,
        loading: true
      }
    });
    const page = this.state.localPeople.page;
    const { coordinate } = this.props.user.public.userCurrentLocation;
    this.userQuery
      .searchTrainers(
        'userCurrentLocation.coordinate',
        coordinate,
        this.state.radius * 8 / 5,
        page
      )
      .then(results => {
        const people = this.state.localPeople.localPeople;
        for (const user of results) {
          const id = { id: user._id };
          if (this.blocks[user._id]) continue;
          people.push(Object.assign({}, user._source, id));
        }
        let reachedEnd = false;
        if (results.length < 10) reachedEnd = true;
        this.setState({
          localPeople: {
            localPeople: people,
            page: page + 1,
            reachedEnd,
            loading: false
          }
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          localPeople: {
            ...this.state.localPeople,
            reachedEnd: true,
            loading: false
          }
        });
        this._updateData([]);
      });
  }

  _setTrendingTags() {
    // for now its just pulling the most used 8 tags. Need to implement the trending table. Once done, that query can be done here.

    this.fireData
      .ref('tags')
      .limitToLast(8)
      .orderByChild('count')
      .once('value')
      .then(data => {
        const vals = data.val();
        let d = Object.keys(vals);
        d = d.sort((x, y) => vals[x].count < vals[y].count);
        this.setState({
          trending: { trending: d, loading: false, viewing: 'Trending' }
        });
      });
  }

  _setAllTags() {
    this.fireData
      .ref('tags')
      .once('value')
      .then(data => {
        this.setState({
          trending: {
            trending: Object.keys(data.val()),
            loading: false,
            viewing: 'All'
          }
        });
      });
  }

  _getTags(type) {
    this.setState({ trending: { trending: [], loading: true, viewing: type } });
    if (type === 'Trending') {
      this._setTrendingTags();
    } else {
      this._setAllTags();
    }
  }

  _setLatestPosts(set) {
    if (set) {
      this.setState({
        content: {
          ...this.state.content,
          loading: false,
          exploring: 'Posts'
        }
      });
      return;
    }

    this.setState({
      content: {
        ...this.state.content,
        loading: true,
        exploring: 'Posts'
      }
    });
    const count = this.state.latestPostsCount;
    let latestPostsEnd = this.state.latestPostsEnd;
    this.fireData
      .ref('posts')
      .limitToLast(count)
      .once('value')
      .then(posts => {
        const postData = posts.val();
        if (Object.keys(postData).length < count) latestPostsEnd = true;
        this.setState({
          latestPosts: postData,
          latestPostsCount: count + 9,
          latestPostsEnd,
          content: { ...this.state.content, loading: false }
        });
      });
  }

  _changeLoc(loc) {
    this.setState({
      loc
    });
  }

  _searchByLocation() {
    const { coordinate } = this.props.user.public.userCurrentLocation;
    this.userQuery
      .searchByLocation('userCurrentLocation.coordinate', coordinate, 24)
      .then(results => this._updateData(results))
      .catch(error => {
        console.log(error);
        this._updateData([]);
      });
  }

  _updateData(data, thing) {
    const users = [];
    data.forEach(d => {
      if (d._id !== this.props.uID)
        users.push({
          ...user._source,
          userID: user._id
        });
    });
  }

  _switchTab(tab) {
    this.setState(
      {
        activeTab: tab
      },
      () => {
        if (this.state.text === this.state.searchResults[tab].lastQ) {
        } else if (tab === 'top') {
        } else if (this.state.text.length) {
          this._textChange(this.state.text);
        } else {
          this._resetSearch();
        }
      }
    );
  }

  _textChange(text) {
    this.setState({ searchMode: true });
    clearTimeout(this.typingTimer);
    this.setState({ text });
    if (text.length) {
      this.typingTimer = setTimeout(() => {
        if (text !== this.state.searchResults.q) {
          this._resetSearch(true);
        }
        switch (this.state.activeTab) {
          case 'top':
            this._getTopSearch(text);
            break;
          case 'users':
            this._getUserSearch(text);
            break;
          case 'posts':
            this._getPostSearch(text);
            break;
          case 'events':
            this._getEventSearch(text);
            break;
          case 'tags':
            this._getTagSearch(text);
            break;
          default:
            return null;
        }
      }, this.doneTypingInterval);
    } else {
      this._resetSearch();
    }
  }

  _updateTopSearch(section) {
    const text = this.state.searchResults.q;
    let { page, endReached } = this.state.top[section];
    switch (section) {
      case 'users':
        this.userQuery
          .searchByInput('full_name', text, page, 5)
          .then(results => {
            page++;
            if (results.length < 5) endReached = true;
            const filteredResults = results.filter(
              user => !this.blocks[user._id]
            );

            this.setState({
              searchResults: {
                ...this.state.searchResults,
                top: {
                  ...this.state.searchResults.top,
                  users: [
                    ...this.state.searchResults.top.users,
                    ...filteredResults
                  ],
                  lastQ: text
                },
                q: text,
                searching: false
              },
              top: {
                ...this.state.top,
                users: { page, endReached }
              }
            });
          })
          .catch(error => {
            console.log(error);
            this.setState({
              searchResults: {
                ...this.state.searchResults,
                top: {
                  ...this.state.searchResults.top,
                  lastQ: text
                },
                q: text,
                searching: false
              },
              top: {
                ...this.state.top,
                users: { page, endReached: true }
              }
            });
          });
        break;
      case 'posts':
        this.postQuery
          .searchByInput('title', text, page, 4)
          .then(results => {
            if (results.length < 4) endReached = true;
            page++;

            this.setState({
              searchResults: {
                ...this.state.searchResults,
                top: {
                  ...this.state.searchResults.top,
                  posts: [...this.state.searchResults.top.posts, ...results],
                  lastQ: text
                },
                q: text,
                searching: false
              },
              top: {
                ...this.state.top,
                posts: { page, endReached }
              }
            });
          })
          .catch(error => {
            console.log(error);
            this.setState({
              searchResults: {
                ...this.state.searchResults,
                top: {
                  ...this.state.searchResults.top,
                  lastQ: text
                },
                searching: false,
                q: text
              },
              top: {
                ...this.state.top,
                posts: { page, endReached: true }
              }
            });
          });
        break;
      case 'events': {
        const searchSettings = Object.assign({}, this.state.searchSettings);
        searchSettings.fromTime = Date.now();

        this.eventQuery
          .advancedEventSearch(text, searchSettings, page, 2)
          .then(results => {
            if (results.length < 2) endReached = true;
            page++;

            this.setState({
              searchResults: {
                ...this.state.searchResults,
                top: {
                  ...this.state.searchResults.top,
                  events: [...this.state.searchResults.top.events, ...results],
                  lastQ: text
                },
                q: text,
                searching: false
              },
              top: {
                ...this.state.top,
                events: { page, endReached }
              }
            });
          })
          .catch(error => {
            console.log(error);
            this.setState({
              searchResults: {
                ...this.state.searchResults,
                top: {
                  ...this.state.searchResults.top,
                  lastQ: text
                },
                searching: false,
                q: text
              },
              top: {
                ...this.state.top,
                events: { page, endReached: true }
              }
            });
          });
        break;
      }
      default:
        console.log('SEARCH TAB, DEFAULT CASE  section: ', section);
    }
  }

  _getTopSearch(text) {
    if (!text && text === this.state.searchResults.users.lastQ) {
      return;
    }
    this.setState({
      searchResults: { ...this.state.searchResults, searching: true },
      top: {
        users: { page: 0, endReached: false },
        posts: { page: 0, endReached: false },
        events: { page: 0, endReached: false }
      }
    });

    let userPage = this.state.top.users.page;
    let userEndReached = this.state.top.users.endReached;
    this.userQuery
      .searchByInput('full_name', text, userPage, 5)
      .then(results => {
        if (results.length < 5) userEndReached = true;
        userPage++;
        const filteredResults = results.filter(user => !this.blocks[user._id]);

        this.setState({
          searchResults: {
            ...this.state.searchResults,
            top: {
              ...this.state.searchResults.top,
              users: filteredResults,
              lastQ: text
            },
            q: text,
            searching: false
          },
          top: {
            ...this.state.top,
            users: { page: userPage, endReached: userEndReached }
          }
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            top: {
              ...this.state.searchResults.top,
              users: 'no results',
              lastQ: text
            },
            q: text,
            searching: false
          },
          top: {
            ...this.state.top,
            users: { page: userPage, endReached: userEndReached }
          }
        });
      });

    let postPage = this.state.top.posts.page;
    let postEndReached = this.state.top.posts.endReached;
    this.postQuery
      .searchByInput('title', text, postPage, 4)
      .then(results => {
        if (results.length < 4) postEndReached = true;
        postPage++;

        this.setState({
          searchResults: {
            ...this.state.searchResults,
            top: {
              ...this.state.searchResults.top,
              posts: results,
              lastQ: text
            },
            q: text,
            searching: false
          },
          top: {
            ...this.state.top,
            posts: { page: postPage, endReached: postEndReached }
          }
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            top: {
              ...this.state.searchResults.top,
              posts: 'no results',
              lastQ: text
            },
            searching: false,
            q: text
          },
          top: {
            ...this.state.top,
            posts: { page: postPage, endReached: postEndReached }
          }
        });
      });

    const searchSettings = Object.assign({}, this.state.searchSettings);
    searchSettings.fromTime = Date.now();

    let eventsPage = this.state.top.events.page;
    let eventsEndReached = this.state.top.events.endReached;
    this.eventQuery
      .advancedEventSearch(text, searchSettings, eventsPage, 2)
      .then(results => {
        if (results.length < 2) eventsEndReached = true;
        eventsPage++;

        this.setState({
          searchResults: {
            ...this.state.searchResults,
            top: {
              ...this.state.searchResults.top,
              events: results,
              lastQ: text
            },
            q: text,
            searching: false
          },
          top: {
            ...this.state.top,
            events: { page: eventsPage, endReached: eventsEndReached }
          }
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            top: {
              ...this.state.searchResults.top,
              events: 'no results',
              lastQ: text
            },
            searching: false,
            q: text
          },
          top: {
            ...this.state.top,
            events: { page: eventsPage, endReached: eventsEndReached }
          }
        });
      });
  }

  _getUserSearch(text, getMore = false) {
    text = text || this.state.searchResults.q;

    if (text === this.state.searchResults.users.lastQ && !getMore) {
      return;
    }
    this.setState({
      searchResults: {
        ...this.state.searchResults,
        searching: true
      }
    });

    let { page, endReached } = this.state.searchResults.users;
    this.userQuery
      .searchByInput('full_name', text, page, 20)
      .then(results => {
        if (results.length < 20) endReached = true;
        page++;
        console.log(results);
        const filteredResults = results.filter(user => !this.blocks[user._id]);
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            users: {
              users: [
                ...this.state.searchResults.users.users,
                ...filteredResults
              ],
              lastQ: text,
              page,
              endReached
            },
            q: text,
            searching: false
          }
        });
      })
      .catch(error => {
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            users: {
              users:
                page > 0
                  ? [...this.state.searchResults.users.users]
                  : 'no results',
              lastQ: text,
              page,
              endReached: true
            },
            q: text,
            searching: false
          }
        });
      });
  }

  _getPostSearch(text, getMore = false) {
    text = text || this.state.searchResults.q;

    if (text === this.state.searchResults.posts.lastQ && !getMore) {
      return;
    }
    this.setState({
      searchResults: {
        ...this.state.searchResults,
        searching: true
      }
    });

    let { page, endReached } = this.state.searchResults.posts;

    this.postQuery
      .searchByInput('title', text, page, 20)
      .then(results => {
        if (results.length < 20) endReached = true;
        page++;

        this.setState({
          searchResults: {
            ...this.state.searchResults,
            posts: {
              posts: [...this.state.searchResults.posts.posts, ...results],
              lastQ: text,
              page,
              endReached
            },
            q: text,
            searching: false
          }
        });
      })
      .catch(error => {
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            posts: {
              posts:
                page > 0
                  ? [...this.state.searchResults.posts.posts]
                  : 'no results',
              lastQ: text,
              page,
              endReached: true
            },
            q: text,
            searching: false
          }
        });
      });
  }

  _getEventSearch(text, getMore = false) {
    text = text || this.state.searchResults.q;
    if (text === this.state.searchResults.events.lastQ && !getMore) {
      return;
    }
    this.setState({
      searchResults: {
        ...this.state.searchResults,
        searching: true
      }
    });

    let { page, endReached } = this.state.searchResults.events;

    this.eventQuery
      .advancedEventSearch(text, this.state.searchSettings, page, 20)
      .then(results => {
        if (results.length < 20) endReached = true;
        page++;

        this.setState({
          searchResults: {
            ...this.state.searchResults,
            events: {
              events: [...this.state.searchResults.events.events, ...results],
              lastQ: text,
              page,
              endReached
            },
            q: text,
            searching: false
          }
        });
      })
      .catch(error => {
        this.setState({
          searchResults: {
            ...this.state.searchResults,
            events: {
              events:
                page > 0
                  ? [...this.state.searchResults.events.events]
                  : 'no results',
              lastQ: text,
              page,
              endReached: true
            },
            q: text,
            searching: false
          }
        });
      });
  }

  _getTagSearch(text) {
    if (text.toLowerCase() === this.state.searchResults.tags.lastQ) {
      return;
    }
    this.setState({
      searchResults: { ...this.state.searchResults, searching: true }
    });

    // havent set up an elastic search for tags so for now we will be doing a firbase data pull and then a filter.
    const lowerText = text.toLowerCase();
    this.fireData
      .ref('tags')
      .once('value')
      .then(data => {
        const filteredData = Object.keys(data.val())
          .map(d => ({
            _type: 'tag',
            _id: d,
            _source: data.val()[d]
          }))
          .filter(d => d._id.indexOf(lowerText) === 0);
        if (filteredData.length) {
          this.setState({
            searchResults: {
              ...this.state.searchResults,
              tags: { tags: filteredData, lastQ: text },
              q: text,
              searching: false
            }
          });
        } else {
          this.setState({
            searchResults: {
              ...this.state.searchResults,
              tags: { tags: 'no results', lastQ: text },
              q: text,
              searching: false
            }
          });
        }
      });
  }

  _resetSearch(searching = false) {
    this.setState({
      searchResults: {
        q: '',
        top: { users: [], posts: [], events: [], tags: [], lastQ: '' },
        users: { users: [], lastQ: '', page: 0, endReached: false },
        posts: { posts: [], lastQ: '', page: 0, endReached: false },
        events: { events: [], lastQ: '', page: 0, endReached: false },
        tags: { tags: [], lastQ: '' },
        searching
      }
    });
  }

  _goToProfile(id) {
    const isMyProfile = id === this.props.uID;

    if (isMyProfile) {
      return this.props.screenProps.tabNavigation.navigate('Profile');
    }

    this.props.navigation.navigate('ProfileEntry', { otherUID: id });
  }

  _goToPost(contentID) {
    this.props.navigation.navigate('PostView', { postID: contentID });
  }

  _goToEvent(content) {
    const isAdmin =
      (content.organizers && !!content.organizers[this.props.uID]) || false;

    this.props.navigation.navigate('EventScene', {
      eventID: content.contentID,
      isAdmin
    });
  }

  _stopSearching() {
    this.setState({ searchMode: false, activeTab: 'top' }, () => {
      this._resetSearch();
    });
  }

  _renderHeader() {
    return (
      <HeaderInView customStyles={isAndroid ? { zIndex: 0 } : []}>
        <View
          style={{
            alignSelf: 'flex-start',
            justifyContent: 'center',
            height: 80,
            paddingTop: 12,
            zIndex: 0
          }}
        >
          <SearchBar
            style={{
              position: 'absolute',
              height: 30,
              top: 30,
              left: 10,
              right: 10
            }}
            ref="searchBar"
            placeholder="Search"
            onCancel={this._stopSearching.bind(this)}
            hideBackground
            showsCancelButton={this.state.searchMode}
            onChangeText={this._textChange.bind(this)}
            backgroundColor={'transparent'}
          />
        </View>
      </HeaderInView>
    );
  }

  _getContentByTag(tag) {
    this.setState({
      content: { content: [], loading: true, exploring: `#${tag}` }
    });

    this.fireData
      .ref(`tags/${tag}/items`)
      .limitToLast(9)
      .once('value', data => {
        const d = data.val();
        Object.keys(d).forEach(key => {
          const type = d[key].type;
          this.fireData.ref(`${type}s/${key}`).once('value', content => {
            const c = content.val();
            c.contentID = key;
            c.contentType = type;
            this.setState({
              content: {
                ...this.state.content,
                content: [...this.state.content.content, c],
                loading: false
              }
            });
          });
        });
      });
  }

  _setSearchDistance(d) {
    this.setState(
      {
        radius: d,
        localPeople: {
          localPeople: [],
          page: 0,
          reachedEnd: false,
          loading: true
        }
      },
      () => this._getLocalTrainers()
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {this._renderHeader()}
        {!this.state.searchMode ? (
          <View style={{ flex: 1 }}>
            <LocalTrainers
              onPress={() => {
                this.props.navigation.navigate('FindTrainer');
              }}
            />
            {
              // <Trending
              //   {...this.props}
              //   {...this.state.trending}
              //   onTagPress={this._getContentByTag.bind(this)}
              //   getTags={this._getTags.bind(this)}/>
            }
            <LocalPosts
              {...this.props}
              {...this.state.content}
              latestPosts={this.state.latestPosts}
              getPosts={this._setLatestPosts.bind(this, true)}
              fetchMore={this._setLatestPosts.bind(this, false)}
              latestPostsEnd={this.state.latestPostsEnd}
            />
          </View>
        ) : (
          <SearchTabs
            {...this.props}
            searchResults={this.state.searchResults}
            query={this.state.text}
            activateTab={this._switchTab.bind(this)}
            goToProfile={this._goToProfile.bind(this)}
            goToPost={this._goToPost.bind(this)}
            goToEvent={this._goToEvent.bind(this)}
            eventSearchSettings={this.state.searchSettings}
            top={this.state.top}
            updateTopSearch={this._updateTopSearch.bind(this)}
            getMoreUsers={this._getUserSearch.bind(this)}
            getMoreEvents={this._getEventSearch.bind(this)}
            getMorePosts={this._getPostSearch.bind(this)}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    user: state.user.user,
    FitlyFirebase: state.app.FitlyFirebase,
    tabState: state.navState.tabs,
    blocks: state.blocks.blocks
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push, pop }, dispatch)
  };
};

const ConnectedSearch = connect(mapStateToProps, mapDispatchToProps)(Search);

const searchRoutes = {
  Search: { screen: ConnectedSearch },
  FindTrainer: { screen: commingSoon },
  PostView: { screen: PostView },
  PostImagesView: { screen: PostImagesView },
  ProfileEntry: { screen: ProfileEntry },
  ImageView: { screen: ImageView },
  TaggedView: { screen: TaggedView },
  UserSearchResults: { screen: UserSearchResults },
  EventScene: { screen: EventScene }
};

const SearchStackNavigator = StackNavigator(searchRoutes, {
  headerMode: 'none',
  initialRouteName: 'Search',
  transitionConfig: () => ({
    transitionSpec: {
      duration: 0,
      timing: Animated.timing
    }
  })
});

class SearchNavigationWrapper extends React.Component {
  static navigationOptions = {
    tabBarIcon: () => <FAIcons name="search" size={24} color="white" />
  };

  render() {
    const { navigation, screenProps } = this.props;
    const { rootNavigation } = screenProps;
    const navigationPropsToPass = {
      tabNavigation: navigation,
      rootNavigation
    };

    return <SearchStackNavigator screenProps={navigationPropsToPass} />;
  }
}

export default SearchNavigationWrapper;
