import React, { Component } from 'react';
import { View, ListView, Text, Dimensions, TextInput, Image, StyleSheet, ActivityIndicator, TouchableOpacity, InteractionManager } from 'react-native';
import HeaderInView from '../header/HeaderInView.js'
import SearchBar from 'react-native-search-box';
const FitlyBlue = '#1D2F7B';
let screenWidth = Dimensions.get('window').width;
import Query from '../library/Query';

const Search = StyleSheet.create({
  container:{
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  defaultImg: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    borderColor: FitlyBlue,
    borderWidth: 1,
    justifyContent: 'center'
  },
  trainerImg: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    borderColor: '#FF0000',
    borderWidth: 1,
    justifyContent: 'center'
  },
  proImg: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    borderColor: 'gold',
    borderWidth: 1,
    justifyContent: 'center'
  },
  row:{
    flex: 1,
    width: screenWidth-30,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  }
})


class PeopleSearch extends Component{
  constructor(props){
    super(props);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.userQuery = new Query('user', this.props.navigation.state.params.uID);
    this.state={
      loading: true,
      dataSource: ds.cloneWithRows([]),
      text: '',
      users: [],
      searchMode: false,
    }
    this.doneTypingInterval = 500;
    this.typingTimer;
    this.blocks = this.props.blocks || {};
  }


  componentDidMount() {
    console.log('People Search props', this.props)
    this._searchByLocation();
  }

  _searchByLocation() {
    const { coordinate } = this.props.navigation.state.params.user.public.userCurrentLocation;
    this.userQuery.searchByLocation('userCurrentLocation.coordinate', coordinate, 24)
    .then(results => this._updateData(results))
    .catch(error => {
      console.log("ERRORX", error);
      this._updateData([]);
    })
  }

  _updateData(data){
    let users =[];
    data.forEach(user => {
      if(user._id !== this.props.uID && !this.blocks[user._id]){
        users.push({
          ...user._source,
          userID: user._id
        })
      }
    });
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(users),
      users: users,
      loading: false,
    })
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{icon: "ios-arrow-round-back-outline"}}
        rightElement={{text: ""}}
        _onPressLeft={() => this.props.navigation.goBack()}
      >
      <View style={{alignSelf: 'flex-start', justifyContent: 'center', height: 80, paddingTop: 12, marginLeft: 50, zIndex: 0}}>

        <SearchBar
          contentWidth={screenWidth - 70}
          middleWidth={(screenWidth - 70)/2}
          ref='peopleSearchBar'
          placeholder='Search'
          onFocus={() => this.setState({searchMode: true})}
          onCancel={() => this.setState({searchMode: false})}
          hideBackground={true}
          showsCancelButton={true}
          onChangeText={this._textChange.bind(this)}
          backgroundColor={'transparent'}
        />
      </View>
      </HeaderInView>
    );
  };


  _renderRow(user, sectionID, rowID){
    if(user.userID === this.props.uID) return null;
    return (
      <View style={{flex: 1}}>
      <TouchableOpacity
        onPress={()=>this.props.onClick(user)}>
      <View style={Search.row}>
        <Image
          style={Search[user.account + 'Img']}
          source={{uri: user.picture}}
          defaultSource={require('../../img/default-user-image.png')}/>
        <Text>
          {user.first_name + ' ' + user.last_name}
        </Text>
      </View>
      </TouchableOpacity>
      </View>
    )
  }

  _textChange(text){
    clearTimeout(this.typingTimer);
    this.setState({text: text})
    if (text.length) {
      this.typingTimer = setTimeout(()=>{
        this.userQuery.searchByInput('full_name', this.state.text)
        .then(results => this._updateData(results))
        .catch(error => {
          console.log(error);
          this._updateData([]);
        });
      }, this.doneTypingInterval);
    } else {
      this._searchByLocation();
    }
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted){
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


  render() {
    return (
      <View style={Search.container}>
        {this._renderHeader()}
        {this.state.loading ? <ActivityIndicator animating={this.state.loading} style={{height: 80}} size="large"/> : null}
        {!this.state.loading && this.state.users.length === 0 ? <Text>no matches</Text> : null}
        <ListView
          style={{flex: 1}}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)}
          renderSeparator={this._renderSeparator.bind(this)}
          enableEmptySections={true}/>
      </View>
    );
  }
}

export default PeopleSearch;
