import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, ListView, Keyboard, Dimensions, Modal, Alert, Platform } from 'react-native';
import { activityTabStyle, headerHeight, tabHeight, FitlyBlue, profileStyle } from '../../styles/styles.js';
import { push } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SearchBar from 'react-native-search-box';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderInView from '../../header/HeaderInView.js';
import ActivityCalendar from './ActivityCalendar.js';
import ActivitySearchResultEntry from './ActivitySearchResultEntry.js';
import RadarIcon from '../../common/RadarIcon'

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const menuOptions = [{text: 'Favorites', icon: 'ios-star-outline'}, {text: 'Friends', icon: 'ios-people-outline'}, {text: 'Past Events', icon: 'ios-calendar-outline'}];

const isAndroid = Platform.OS === 'android';


class Activity extends Component {
  constructor(props) {
    super(props);
    this.searchDataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchResults: this.searchDataSource.cloneWithRows([]),
      searchMode: false,
      error: null,
      page: 0,
      hidden: true,
      input: '',
      menuOpen: false,
    }
    this._openLocationPicker = this._openLocationPicker.bind(this);
    this.database = this.props.FitlyFirebase.database();
    this._loadMoreResults = this._loadMoreResults.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.tabState.index === 0;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tabState.index === 0) {
      this.setState({hidden: false});
    }
  }

  _renderHeader() {
    const screenWidth = Dimensions.get('window').width;
    return (
      <HeaderInView customStyle>
        <View style={{alignSelf: 'stretch', position: 'absolute', left: 0, top: isAndroid ? 15 : 25, alignItems: 'flex-start', justifyContent: 'center'}}>
          <SearchBar
            ref='activitySearchBar'
            contentWidth={screenWidth - 70}
            middleWidth={(screenWidth - 70)/2}
            placeholder='Search'
            // onChange={({nativeEvent: {text}}) => this.setState({input: text})}
            onFocus={() => {
              if (!this.state.searchMode) this.setState({searchResults: this.state.searchResults.cloneWithRows([])})
              this.setState({searchMode: true, error: null})
            }}
            onCancel={() => this.setState({searchMode: false})}
            hideBackground={true}
            showsCancelButton={true}
            onSearchButtonPress={(input) => {
              this._searchEvent(input)
              .then(results => this.setState({searchResults: this.state.searchResults.cloneWithRows(results), input: input}))
              .catch(error => {
                console.log(error);
                this.setState({searchResults: this.state.searchResults.cloneWithRows([]), error: error})
              });
            }}
            backgroundColor={'transparent'}
          />
        </View>
        <TouchableOpacity style={{position: 'absolute', right: 10, top: isAndroid ? 20 : 30, width: 40, height: 40, alignItems: 'center', backgroundColor: FitlyBlue}}
          onPress={this._openMenu.bind(this)}>
          <Icon
            name={this.state.menuOpen ? 'ios-options' : 'ios-options-outline'}
            size={30}
            color='white'/>
        </TouchableOpacity>
      </HeaderInView>
    );
  };



  _searchEvent(input, page = 0) {
    this.setState({loading: true});
    console.log({distance: this.props.searchLocation.radius + 'km',
    'location.coordinate': this.props.searchLocation.coordinate});
    const queryBody = {
      sort: [
        { "startDate" : {order: "asc"}},
        { "memberCount" : "asc" },
        "_score"
      ],
      query : {
        filtered: {
          filter: {
            bool: {
              must: [
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
                  }
                },
                {
                  term: {
                    isPublic: true
                  }
                },
                {
                  range: {
                    startDate: {
                      gte: new Date().getTime()
                    }
                  }
                },
              ],
              filter: {
                geo_distance: {
                  distance: this.props.searchLocation.radius + 'km',
                  'location.coordinate': this.props.searchLocation.coordinate
                }
              }
            }
          }
        }
      }
    };
    let fetchSize = 2;
    const query = {
      index: 'firebase',
      type: 'event',
      size: fetchSize,
      from: page * fetchSize,
      body: JSON.stringify(queryBody) //because there is '.' in the object, it cannot be a valid json, therefore must first be stringify, see: https://github.com/firebase/flashlight/issues/91
    };

    return new Promise((resolve, reject) => {
      const key = this.database.ref('/search/request').push(query).key;
      this.database.ref('/search/response/' + key).on('value', showResults.bind(this));
      function showResults(snap) {
        if (!snap.exists()) { return; }
        snap.ref.off('value', showResults);
        // console.log(snap.val());
        snap.ref.remove();
        const results = snap.val().hits;
        if (!results || !results.hits) {
          reject(new Error('no match are found'));
        } else {
          resolve(results.hits);
        }
        this.setState({loading: false});
      }
    })
  }

  //TODO: this should be a seperate component
  _renderSearchResults() {
    return (
      <View style={{flex: 1, position: 'absolute', zIndex: 2, top: headerHeight, bottom: tabHeight, left: 0, right: 0, backgroundColor: 'white'}}>
        {(this.state.searchResults.getRowCount())
          ? <ListView
            onScroll={() => {
              this.refs.activitySearchBar.unFocus();
              Keyboard.dismiss();
            }}
            onEndReachedThreshold={10}
            automaticallyAdjustContentInsets={false}
            contentInset={{bottom:100}}
            ref="eventSearchResults"
            dataSource={this.state.searchResults}
            renderRow={(rowData) => <ActivitySearchResultEntry data={rowData} searchMode={this.state.searchMode}/>}
            onEndReached={this._loadMoreResults}
          />
          : <View>
              <Text style={{textAlign: 'center', marginTop: 10, color: '#aaa'}}>{(this.state.error) ? this.state.error.message : 'no matches'}</Text>
            </View>
        }
      </View>
    )
  }

  _loadMoreResults() {
    this._searchEvent(this.state.input, this.state.page + 1)
    .then(data => {
      this.setState({
        searchResults: this.state.searchResults.cloneWithRows(this.state.searchResults._dataBlob.s1.concat(data)),
        page: this.state.page + 1})
    })
    .catch(err => {
      console.log('no more match can be found', err);
      this.setState({page: this.state.page - 1});
    })
  }

  _renderCalenderEvents() {
    return (
      <View style={{flex: 1, zIndex: 1}}>
        <ActivityCalendar/>
        {
        // <View style={activityTabStyle.footer}>
        //   <TouchableOpacity style={activityTabStyle.footerBtn} onPress={this._openLocationPicker}>
        //     <Text style={activityTabStyle.footerBtnText}>
        //       Radius  </Text>
        //     <RadarIcon iconSize={30} color={'white'}/>
        //   </TouchableOpacity>
        //   <TouchableOpacity
        //     style={activityTabStyle.footerBtn}
        //     onPress={() => this.props.navigation.push({key: "CreateActivityScene", global: true})}>
        //     <Text style={activityTabStyle.footerBtnText}>Create Activity  </Text>
        //     <Icon name="md-add" size={30} color={'white'}/>
        //   </TouchableOpacity>
        // </View>
        }
      </View>
    );
  }

  _openLocationPicker() {
    if (this.state.menuOpen) {
      this.setState({ menuOpen: false });
    }
    this.props.navigation.push({
      key: "LocationPicker",
      global: true
    })
  }

  _openMenu(){
    this.setState({menuOpen: !this.state.menuOpen})
  }

  _modifyAdress(address: string){
    let copy = address.slice(0);
    return copy.split(', ').slice(1, 2).join(', ');
  }

  _renderCreateEventButton(){
    return (<TouchableOpacity
        style={profileStyle.blueBtn}
        onPress={() => this.props.navigation.push({key: "CreateActivityScene", global: true})}>
        <Icon name="md-add" size={30} color={'white'}/>
      </TouchableOpacity>)
  }

  _renderMenu(){
    let { address, placeName } = this.props.searchLocation;
    return (
          <View style={{position: 'absolute', top: 90, right: 10, borderColor: '#aaa', borderWidth: 1, flex: 1, flexDirection: 'column', zIndex: 200, backgroundColor: '#fff', padding: 10, shadowColor: "black", shadowOpacity: .6, elevation: 2, shadowOffset: {width: 0, height: 0}, shadowRadius: 2}}>
            <View
              style={{borderBottomWidth: .5, borderColor: '#555', paddingVertical: 10}}>
              <TouchableOpacity
                onPress={this._openLocationPicker}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
                      <View style={{width: 30}}>
                        <Icon name="ios-pin-outline" size={30} color={'#555'}/>
                      </View>
                      <Text style={{paddingLeft: 5}}>Location: </Text>
                    </View>
                    <Text style={{textAlign: 'right', paddingLeft: 5, maxWidth: 200}}>{ address && this._modifyAdress(address) || placeName }</Text></View>
                </TouchableOpacity>
              </View>
              <View
                style={{borderBottomWidth: .5, borderColor: '#555', paddingVertical: 10}}>
                <TouchableOpacity
                  onPress={this._openLocationPicker}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
                      <View style={{width: 30}}>
                        <Icon name="ios-disc-outline" size={30} color={'#555'}/>
                      </View>
                      <Text style={{paddingLeft: 5}}>Radius: </Text>
                    </View>
                    <Text style={{textAlign: 'right', paddingLeft: 5}}>
                      {Math.round(this.props.searchLocation.radius/1609.34)} Miles
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            {menuOptions.map((option, i) => {
              let last = i === (menuOptions.length - 1);
              return (
                <View
                  key={option.text}
                  style={{borderBottomWidth: (last ? 0 : .5), borderColor: '#555'}}>
                  <TouchableOpacity
                    onPress={this._showAlert.bind(this)}>
                    <View style={{flexDirection: 'row', paddingVertical: 10, alignItems: 'center'}}>
                      <View style={{width: 30}}>
                        <Icon name={option.icon} size={30} color={'#aaa'}/>
                      </View>
                      <Text style={{color: '#aaa', fontStyle: 'italic', paddingLeft: 5}}>{option.text}</Text>
                    </View>
                  </TouchableOpacity>
                </View>)
              })
            }
          </View>
    )
  }

  _showAlert(){
    if (this.state.menuOpen) {
      this.setState({ menuOpen: false });
    }
    Alert.alert('currently not available');
  }

  render() {
    let { address, placeName } = this.props.searchLocation;

    return (this.state.hidden)
      ? <View></View>
      : <View style={activityTabStyle.main}>
        {this._renderHeader()}
        {this._renderCreateEventButton()}
        {this.state.menuOpen && this._renderMenu()}
        {this.state.menuOpen &&
          <TouchableOpacity
            style={{position: 'absolute', minWidth: screenWidth, minHeight: screenHeight, zIndex: 99}}
            onPress={()=>this.setState({menuOpen: false})}/>}
        {(this.state.searchMode) ? this._renderSearchResults() : this._renderCalenderEvents()}
      </View>
  }
};

const mapStateToProps = function(state) {
  return {
    tabState: state.navState.tabs,
    searchLocation: state.app.searchLocation,
    user: state.user.user,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    navigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
