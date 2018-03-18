import React, { Component } from 'react';
import {
  View,
  ListView,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import { connect } from 'react-redux';
import { FitlyBlue } from '../styles/styles';

import HeaderInView from '../header/HeaderInView.js';

import { NavigationActions } from 'react-navigation';

const screenWidth = Dimensions.get('window').width;

const isAndroid = Platform.OS === 'android';

const UserStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  defaultImg: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    borderColor: FitlyBlue,
    borderWidth: 2,
    justifyContent: 'center',
  },
  trainerImg: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    borderColor: '#ff0000',
    borderWidth: 2,
    justifyContent: 'center',
  },
  proImg: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    borderColor: 'gold',
    borderWidth: 2,
    justifyContent: 'center',
  },
  row: {
    flex: 1,
    width: screenWidth - 30,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerText: {
    alignSelf: 'center',
    alignItems: 'center'
  }
});

class UserListView extends Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2 && r1.value !== r2.value,
    });

    this.state = {
      loading: true,
      dataSource: ds.cloneWithRows([]),
      users: [],
      includes: {},
    };
    this.fbData = this.props.FitlyFirebase.database();
    this.blocks = this.props.blocks;
  }

  componentWillMount() {
    const { uID, dbRef } = this.props.navigation.state.params;
    if (this.props.userSearch) {
      console.log('user search true');
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.props.data),
        users: this.props.navigation.state.params.data,
        loading: false,
        includes: this.props.includes,
      });
    } else {
      console.log('not null')
      this.fbData
        .ref(`${dbRef}/${uID}`)
        .once('value')
        .then(usersData => {
          const users = usersData.val();
          if(!users) {
            console.log('No users :c')
            this.setState({
              loading: false,
              dataSource: null,
              users: null,
            })
            return;
          }
          console.log('More items')
          Object.keys(users)
            .filter(id => !this.blocks[id])
            .forEach(userID => {
              this.fbData
                .ref(`users/${userID}/public`)
                .once('value')
                .then(userData => {
                  let users = this.state.users;
                  const user = userData.val();
                  user.userID = userID;
                  users = [...users, user];
                  this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(users),
                    users,
                    loading: false,
                  });
                });
            });
        })
        .catch(e => {
          console.log('There was an error', e)
        })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(
        nextProps.data || this.state.users
      ),
      users: nextProps.data || this.state.users,
      loading: false,
      includes: nextProps.includes || this.state.includes,
    });
  }

  _renderHeader() {
    const customStyles = {
      zIndex: 0
    }
    return (
      <HeaderInView
        customStyles={isAndroid ? customStyles : []}
        leftElement={{ icon: 'ios-close' }}
        title={this.props.navigation.state.params.userType}
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  _onPress(userID, name, pic, account) {
    if (this.props.onPress) {
      this.props.onPress(userID, name, pic, account);
    } else {
      this._goToProfile(userID);
    }
  }

  _renderRow(user, sectionID, rowID) {
    if (
      this.state.includes[user.userID] ||
      this.state.includes[user.full_name] ||
      this.props.uID === user.userID
    )
      return null;
    return (
      <View
        style={{
          flex: 1,
          borderBottomColor: '#CCCCCC',
          borderBottomWidth: 0.5,
        }}
      >
        <TouchableOpacity
          onPress={this._onPress.bind(
            this,
            user.userID,
            user.full_name,
            user.picture,
            user.account
          )}
        >
          <View style={UserStyle.row}>
            <Image
              style={UserStyle[`${user.account}Img`]}
              source={{ uri: user.picture }}
              defaultSource={require('../../img/default-user-image.png')}
            />
            <Text>{`${user.first_name} ${user.last_name}`}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
        }}
      />
    );
  }

  _goToProfile(id) {
    const isMyProfile = this.props.navigation.state.params.uID === id;


    if(isMyProfile) {
      return this.props.navigation.goBack();
    } else {
      this.props.navigation.navigate("ProfileEntry", {otherUID: id});
    }


    // this.props.navigation.navigate("ProfileEntry", {otherUID: id});
  }

  render() {

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {this._renderHeader()}
        {this.state.loading ? (
          <ActivityIndicator
              animating={this.state.loading}
              style={{ height: 80 }}
              size="large"
            />
          ) 
         : null
        }
        {this.state.dataSource ?
        <ListView
          style={{ flex: 1 }}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)}
          enableEmptySections
        />
        : <Text style={UserStyle.centerText}>No match found</Text>}
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    blocks: state.blocks.blocks,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

export default connect(mapStateToProps, {})(UserListView);
