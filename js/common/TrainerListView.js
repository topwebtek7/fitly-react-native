import React, { Component } from 'react';
import { View, ListView, ScrollView, Text, Image, TouchableOpacity, TouchableHighlight, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import Query from '../library/Query';

import HeaderInView from '../header/HeaderInView.js'

const screenWidth = Dimensions.get('window').width;



const UserStyle = StyleSheet.create({
  container:{
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  profilePic: {
    borderRadius: 30,
    borderColor: '#ff0000',
    borderWidth: 2,
    margin: 10,
    width: 60,
    height: 60,
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

class TrainerListView extends Component {
  constructor(props){
    super(props);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return r1 !== r2 && r1.value !== r2.value
      }
    });

    this.state = {
      loading: true,
      dataSource: ds.cloneWithRows([]),
      trainers: [],
      page: 0,
      size: 20,
      reachedEnd: false,
      loading: true,
    }
    this.fbData = this.props.navigation.state.params.FitlyFirebase.database();
    this.blocks = this.props.blocks;
    this.trainerQuery = new Query('user', this.props.uID);
  }

  componentWillMount() {
    this._getLocalTrainers();
  }

  _getLocalTrainers(){
    this.setState({
      loading: true,
    })
    const { page, size } = this.state;
    const { coordinate } = this.props.user.public.userCurrentLocation;
    this.trainerQuery.searchTrainers('userCurrentLocation.coordinate', coordinate, (30*8/5), page, size)
    .then(results => {
      let trainers = Array.from(this.state.trainers);
      console.log('t1', trainers);
      for(let user of results){
        let id = {id: user._id}
        if(this.blocks[user._id]) continue;
        trainers.push(
          Object.assign({}, user._source, id)
        )
      }
      console.log('t2', trainers);
      let reachedEnd = false;
      if (results.length < size) reachedEnd = true;
      this.setState({
        trainers: trainers,
        dataSource: this.state.dataSource.cloneWithRows(trainers),
        page: page+1,
        reachedEnd: reachedEnd,
        loading: false,
      })
    })
    .catch(error => {
      console.log(error);
      this.setState({
        reachedEnd: true,
        loading: false
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.data || this.state.trainers),
      trainers: nextProps.data || this.state.trainers,
      loading: false,
      includes: nextProps.includes || this.state.includes
    })
  }

  _renderHeader(){
    const customStyles = { zIndex: 0 };
    return (
      <HeaderInView
        customStyles={Platform.OS === 'android' ? customStyles : []}
        leftElement={{icon: "ios-close"}}
        title={'Trainers'}
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  }

  _onPress(userID, name, pic){
    if(this.props.onPress){
      this.props.onPress(userID, name, pic);
    } else {
      this._goToProfile(userID);
      this.props.navigation.goBack()
    }
  }

  _renderRow(user, sectionID, rowID){
    return (
      <View style={{flex: 1, borderBottomColor: '#CCCCCC', borderBottomWidth: .5}}>
      <TouchableOpacity
        onPress={this._onPress.bind(this, user.id, user.full_name, user.picture)}>
      <View style={UserStyle.row}>
        <Image
          style={UserStyle.profilePic}
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

  _goToProfile(id) {
    this.props.navigation.navigate("ProfileEntry", {
      otherUID: id
    })
  };


  render(){
    return(
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        {this.props.noHeader ? null : this._renderHeader()}
        {
          this.state.loading ?
          <ActivityIndicator
            animating={this.state.loading}
            style={{height: 80}}
            size="large"/>
          :
          <ListView
            style={{flex: 1}}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections={true}/>
        }
      </View>
    )
  }
}

const mapStateToProps = function(state) {
  return {
    blocks: state.blocks.blocks,
    user: state.user.user,
    uID: state.auth.uID,
  };
};

export default connect(mapStateToProps, {})(TrainerListView);
