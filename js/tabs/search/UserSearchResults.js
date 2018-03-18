import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { activityTabStyle } from '../../styles/styles.js';
import { push } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UserSearchResultEntry from './UserSearchResultEntry.js';
import Query from '../../library/Query';

class UserSearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      page: 0,
    };
    this.database = this.props.FitlyFirebase.database();
    this.userQuery = new Query('user', this.props.uID);
  }

  componentDidMount() {
    this._fetchUsers().then(data => {
      this.setState({data: data})
    });
  }

  componentWillReceiveProps(nextProps) {
    // this._fetchUsers();
    this._searchByLocation();
    console.log(this.props.loc, this.props.searchLocation.coordinate);
  }

  _fetchUsers() {
    this.setState({loading: true});
    // console.log('_fetchEventData');
    const queryBody = {
      query : {
        filtered: {
          filter: {
            bool: {
              filter: {
                geo_distance: {
                  distance: this.props.searchLocation.radius / 1000 + 'km',
                  'userCurrentLocation.coordinate': this.props.loc || this.props.searchLocation.coordinate
                }
              }
            }
          }
        }
      }
    };
    const query = {
      index: 'firebase',
      type: 'user',
      size: 10,
      from: this.state.page,
      body: JSON.stringify(queryBody) //because there is '.' in the object, it cannot be a valid json, therefore must first be stringify, see: https://github.com/firebase/flashlight/issues/91
    };

    return new Promise((resolve, reject) => {
      // console.log(query);
      const key = this.database.ref('/search/request').push(query).key;
      // console.log('/search/response/' + key);
      this.database.ref('/search/response/' + key).on('value', showResults.bind(this));
      // console.log(key, eventQuery);
      function showResults(snap) {
        if (!snap.exists()) { return; }
        snap.ref.off('value', showResults);
        snap.ref.remove();
        // console.log(snap.val());
        const results = snap.val().hits;
        resolve(results && results.hits || []);
        this.setState({loading: false});
      }
    })
  }

  _searchByLocation() {
    const coordinate = this.props.loc;
    this.userQuery.searchByLocation('userCurrentLocation.coordinate', coordinate, 24)
    .then(results => this._updateData(results))
    .catch(error => {
      console.log(error);
      this._updateData([]);
    })
  }

  _updateData(data){
    console.log(data)
  }


  render() {
    console.log('render');
    let screenWidth = Dimensions.get('window').width;
    return (
      <View style={{flex: 1}}>
        <Text style={{textAlign: 'center'}}>work in progress</Text>
        <Text style={{textAlign: 'center'}}>current displaying all users within {Math.round(this.props.searchLocation.radius / 1609.34)} mile radius</Text>
        <ScrollView contentContainerStyle={{flex: 1, backgroundColor: 'white'}}>
          {(this.state.data && this.state.data.length)
            ? this.state.data.map((userData, index) => <UserSearchResultEntry navigation={this.props.navigation} data={userData} key={index}/>)
            : (this.state.loading)
              ? <ActivityIndicator animating={this.state.loading} size="large"/>
              : <Text style={{textAlign: 'center', marginTop: 40, fontSize: 18, color: '#ccc'}}>no users are found</Text>
          }
        </ScrollView>
      </View>
    )
  };
};

const mapStateToProps = function(state) {
  return {
    searchLocation: state.app.searchLocation,
    FitlyFirebase: state.app.FitlyFirebase,
    uID: state.auth.uID,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserSearchResults);
