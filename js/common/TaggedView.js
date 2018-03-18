import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native'
import HeaderInView from '../header/HeaderInView.js'

const screenWidth = Dimensions.get('window').width;
const picSize = screenWidth/3;

export default class TaggedView extends Component {
  constructor(props){
    super(props);
    this.state = {
      tag: '',
      content: [],
      loading: true,
    }
    this.fireData = this.props.FitlyFirebase.database();
  }

  componentWillMount() {
    this.fireData.ref('tags/'+this.props.navigation.state.params.tag+'/items').limitToLast(9).once('value', (data)=>{
      let d = data.val();
      Object.keys(d).forEach(key=>{
        let type = d[key].type;
        this.fireData.ref(type+'s/'+key).once('value', (content)=>{
          const c = content.val();
          c.contentID = key;
          c.contentType = type;
          this.setState({
            content: [ ...this.state.content, c ],
            loading: false,
          })
        })
      })
    })
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{icon: "ios-close"}}
        title={'#' + this.props.navigation.state.params.tag}
        _onPressLeft={() => this.props.navigation.goBack()}
      />
    );
  };

  _renderTaggedContent(){
    return (
      <View style={{flex:1, flexDirection: 'row', flexWrap: 'wrap'}}>
          {this.state.content.map((c, i)=>{
            return this._renderContent(c, i);
          })}
      </View>
    )
  }

  _renderContent(content, key){
    const contentID = content.contentID;
    const contentType = content.contentType;

    let photo;
    if (contentType === 'post'){
      photo = content.photos && Object.keys(content.photos).length ? content.photos[Object.keys(content.photos)[0]].link : false;
    } else {
      photo = content.backgroundImage;
    }

    return (
      <View style={{height: picSize, width: picSize, marginBottom: 2, marginLeft:1, marginRight: 1}} key={key}>
        <TouchableOpacity
          onPress={contentType=== 'post' ? this._goToPost.bind(this, contentID) : this._goToEvent.bind(this, content)}>
          <Image
            source={{uri: photo}}
            style={{height: picSize, width: picSize}}/>
        </TouchableOpacity>
      </View>
    )
  }

  _goToPost(contentID){
    this.props.navigation.navigate("PostView", {
      postID: contentID
    })
  }

  _goToEvent(content){
    let isAdmin = content.organizers && !!content.organizers[this.props.uID] || false;
    this.props.navigation.navigate("EventScene", {
      eventID: content.contentID,
      isAdmin
    })
  }

  render(){
    return(
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        {this._renderHeader()}
        <ScrollView>
        {
          this.state.loading ?
          <ActivityIndicator
            animating={this.props.searching}
            style={{height: 80}}
            size="large"/>
          :
          this._renderTaggedContent()
        }
        </ScrollView>
      </View>
    )
  }

}
