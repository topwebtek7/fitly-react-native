import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, InteractionManager, ActivityIndicator } from 'react-native';

// wanted to implement a trending tag section but for time and convenience I am going to do just a popular tag section.


export default class Trending extends Component{
  constructor(props){
    super(props);
    this.state = {
      trending: this.props.trending,
      loading: this.props.loading,
      viewing: this.props.viewing
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      trending: nextProps.trending,
      loading: nextProps.loading,
      viewing: nextProps.viewing
    })
  }


  _renderHeader(){
    let type = this.state.viewing === 'All' ? 'Popular' : 'All';
    let viewing = this.state.viewing === 'All' ? 'All' : 'Popular';
    let getType = this.state.viewing === 'All' ? 'Trending' : 'All';
    return(
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10, paddingBottom: 5, paddingLeft:30, paddingRight: 30}}>
        <Text
          style={{color: '#aaa', fontSize: 10, fontWeight: 'bold'}}>{viewing} Tags</Text>

        <TouchableOpacity
          onPress={()=>this.props.getTags(getType)}>

          <Text style={{color: 'blue', fontSize: 10}}>
            See {type}
          </Text>

        </TouchableOpacity>
      </View>
    )
  }

  _renderTags(){
    return(
      <ScrollView
        style={{flexDirection: 'row'}}
        horizontal={true}
        showsHorizontalScrollIndicator={false}>
        {this.state.trending.map((tag, i)=>{
          return this._renderTag(tag, i);
        })}
      </ScrollView>
    )
  }

  _renderTag(tag, key){
    let img = <View style={{borderColor: 'black', borderWidth: 1, height: 80, width: 80}}></View>

    let style = {flexDirection: 'column', marginLeft: 30, marginTop: 10};
    if (key === this.state.trending.length-1) style['marginRight'] = 30;
    return(
      <View style={style} key={key}>
        <TouchableOpacity onPress={this._showContent.bind(this, tag)}>
          <Text style={{color: '#565656', textAlign: 'left', fontSize: 16, fontWeight: 'bold'}}># {tag}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _showContent(tag){
    this.props.onTagPress(tag);
  }

  render(){
    return(
      <View style={{
          flexDirection: 'column',
          height: 80,
          justifyContent: 'flex-start',
          backgroundColor: 'white',
          borderBottomWidth: 0.5,
          borderBottomColor: "#ccc"}}>
      {this._renderHeader()}
      {
        this.state.loading ?
          <ActivityIndicator
            animating={this.state.loading}
            style={{height: 60}}
            size="large"/>
          : this._renderTags()
      }
      </View>
    )
  }
}
