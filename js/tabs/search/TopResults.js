import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native'
import {getDateStringByFormat} from '../../library/convertTime'
import { FitlyBlue } from '../../styles/styles'

const screenWidth = Dimensions.get('window').width

export default class TopResearch extends Component {

  _renderHeader(section){
    return(
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10, paddingBottom: 5, paddingLeft:30, paddingRight: 30, borderBottomWidth: 0.5, borderBottomColor: '#ccc', borderTopWidth: 0.5, borderTopColor: '#ccc'}}>
        <Text
          style={{color: '#aaa', fontSize: 10, fontWeight: 'bold'}}>{section}</Text>
      </View>
    )
  }

  _renderSection(section){
    let data = this.props.searchResults[section];
    if(data==='no results') return this._renderNoResults();
    let style = {flex: 1}
    if(!data.length) style['minHeight'] = 200
    let endReached = this.props.top[section].endReached;
    return (
      <View style={style}>
        {data.map((d, i)=>{
          switch (section) {
            case 'users':
              return this._renderUser(d._source, d._id, i);
              break;
            case 'posts':
              return this._renderPost(d._source, d._id, i);
              break;
            case 'events':
              return this._renderEvent(d._source, d._id, i);
              break;
            default:
          }
        })}
        {data.length && !endReached ? this._renderFooter(section) : null}
      </View>
    )
  }

  _renderFooter(section){
    let style = {flexGrow: 1, marginLeft: 30}
    return (
      <View style={style} key={section}>
      <TouchableOpacity
        onPress={()=>this.props.updateTopSearch(section)}>
      <View style={Search.footer}>
        <Text>
          Load More
        </Text>
      </View>
      </TouchableOpacity>
      </View>
    )
  }

  _renderNoResults(){
    return (
      <View style={{padding: 10}}>
        <Text style={{textAlign: 'center'}}>No Results Were Found</Text>
      </View>
    )
  }

  _renderSpinner(){
    return (
      <ActivityIndicator
        animating={this.props.searching}
        style={{height: 80}}
        size="large"/>
    )
  }

  _renderUser(data, id, k){
    let style = {flexGrow: 1, marginLeft: 30}
    if(id === this.props.uID) return;
    return (
      <View style={style} key={data.dateJoined+k}>
      <TouchableOpacity
        onPress={()=>this.props.goToProfile(id)}>
      <View style={Search.row}>
        <Image
          style={data.account === "trainer" ? Search.trainerPic : Search.profilePic}
          source={{uri: data.picture}}/>
        <Text>
          {data.first_name + ' ' + data.last_name}
        </Text>
      </View>
      </TouchableOpacity>
      </View>
    )
  }

  _renderPost(data, id, k){
    let style = {flexGrow: 1, marginLeft: 30}
    let imgLink = data.photos ? data.photos[Object.keys(data.photos)[0]].link : null
    return (
        <View style={style} key={data.createdAt+k}>
        <TouchableOpacity
          onPress={()=>this.props.goToPost(id)}>
        <View style={Search.row}>
          <Image
            style={Search.postPic}
            source={(imgLink) ? {uri: imgLink} : require('../../../img/default-photo-image.png')}/>
          <View style={Search.column}>
            <Text>
              {data.title}
            </Text>
            <Text>
              {data.authorName}
            </Text>
            <Text>
              {data.category}
            </Text>
          </View>
        </View>
        </TouchableOpacity>
        </View>
    )
  }

  _renderEvent(data, id, k){
    let style = {flexGrow: 1, marginLeft: 30}
    return (
      <View style={style} key={data.createdAt+k}>
      <TouchableOpacity
        onPress={()=>this.props.goToEvent(Object.assign({}, data, {contentID: id}))}>
      <View style={Search.row}>
        <Image
          style={Search.eventPic}
          source={(data.backgroundImage) ? {uri: data.backgroundImage} : require('../../../img/default-photo-image.png')}/>
        <View style={Search.column}>
          <Text>
            {data.title}
          </Text>
          <Text>
            Category: {Array.isArray(data.category) ? data.category.join(', ') : data.category}
          </Text>
          <Text>When: {getDateStringByFormat(data.startDate, "ddd, MMM Do, h:mm A")}</Text>
        </View>
      </View>
      </TouchableOpacity>
      </View>
    )
  }

  render(){
    return (
      <ScrollView>
        {this.props.searching ?
          this._renderSpinner() :
          <View style={{paddingBottom: 80}}>
          {this._renderHeader('Users')}
          {this._renderSection('users')}
          {this._renderHeader('Posts')}
          {this._renderSection('posts')}
          {this._renderHeader('Events')}
          {this._renderSection('events')}
          </View>
        }
      </ScrollView>
    )
  }
}


const Search = StyleSheet.create({
  container:{
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  profilePic: {
    borderRadius: 30,
    borderColor: FitlyBlue,
    borderWidth: 2,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: FitlyBlue,
    shadowOpacity: .5,
    //elevation: 2,
    shadowOffset: {width: 1, height: 1},
    shadowRadius: 2,
  },
  trainerPic: {
    borderRadius: 30,
    borderColor: "#FF0000",
    borderWidth: 2,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: "#FF0000",
    shadowOpacity: .5,
    //elevation: 2,
    shadowOffset: {width: 1, height: 1},
    shadowRadius: 2,
  },
  postPic: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: FitlyBlue,
    shadowOpacity: .5,
    //elevation: 2,
    shadowOffset: {width: 1, height: 1},
    shadowRadius: 2,
  },
  eventPic: {
    borderRadius: 30,
    margin: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    shadowColor: FitlyBlue,
    shadowOpacity: .5,
    //elevation: 2,
    shadowOffset: {width: 1, height: 1},
    shadowRadius: 2,
  },
  row:{
    flexGrow: 1,
    width: screenWidth-30,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexGrow: 1,
    height: 30,
    marginBottom: 10,
    width: screenWidth-60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  column: {
    flexGrow: 1,
    width: screenWidth-30,
    height: 72,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
})
