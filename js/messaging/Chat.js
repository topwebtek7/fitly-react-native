import React, { Component } from 'react';
import { View, ListView, TextInput, Text, Platform, InteractionManager } from 'react-native';
import HeaderInView from '../header/HeaderInView.js'
import { GiftedChat, Actions, Bubble } from 'react-native-gifted-chat';
import { connect } from 'react-redux';
import Moment from 'moment'
import { getImageFromCam, getImageFromLib } from '../library/pictureHelper'
import { savePhotoToDB } from '../library/firebaseHelpers.js';
import Firebase from 'firebase';
import uuid from 'uuid';
import { pop, push, resetTo } from '../actions/navigation.js';
import { bindActionCreators } from 'redux';


const FitlyBlue = '#1D2F7B';
const FitlyBlueClear = 'rgba(29,47,123,.8)';


class Chat extends Component{
  constructor(props){
    super(props);
    this.state ={
      messages: [],
    }

    this.dataRef = this.props.FitlyFirebase.database().ref();
    this.chatID = this.props.navigation.state.params.chatID;
    this.contactID = this.props.navigation.state.params.contactID;
    this.contact = this.props.navigation.state.params.contact;
    this.photos;
    this.avatar = this.props.navigation.state.params.profilePic;
  }

  componentWillMount() {
    
    let chatRef = this.dataRef.child('chats/'+this.chatID);
    if(this.chatID){
      chatRef.child('/directMsgs').on('value', (data)=>{this._setMessages(data)});
    } else if (this.contactID){

      const getKey = (data)=>{
        if(data){
          this.chatID = data.chatID;
          this.dataRef.child('chats/'+this.chatID+'/directMsgs').on('value', (data)=>{this._setMessages(data);})
        } else {
          let members = {};
          members[this.contactID] = true;
          members[this.props.uID] = true;
          let chatData = {members: members};

          this.chatID = this.dataRef.child('chats/').push(chatData).key;

          this.dataRef.child('chats/'+this.chatID+'/directMsgs').on('value', (data)=>{this._setMessages(data);})
        }
      }
      this.dataRef.child('userChats/'+this.props.uID+'/'+this.contactID).once('value', (v)=>{
        getKey(v.val());
      });
    }
    }

  componentWillUnmount() {
    this.dataRef.child('chats/'+this.chatID+'/directMsgs').off()
  }

  _setMessages(data){
    let msgs = [];
    data.forEach(msg=>{
      let m = msg.val();
      m.createdAt = Moment(m.createdAt)._d;
      m.user.avatar = this.avatar;
      msgs =[m, ...msgs];
    })
    this.setState({
      messages: msgs,
    })
  }


  _renderHeader() {
    const customStyles = { zIndex: 0 };
    return (
      <HeaderInView
        customStyles={Platform.OS === 'android' ? customStyles : []}
        title={'Message'}
        leftElement={{icon: "ios-arrow-round-back-outline"}}
        rightElement={{text: `${this.contact}`}}
        _onPressLeft={() => this.props.navigation.goBack()}
        _onPressRight={()=> this._openProfile(this.contactID)}
      />
    );
  };

  _openProfile(id) {
    // InteractionManager.runAfterInteractions(()=>{
      this.props.navigation.navigate("ProfileEntry", {
        otherUID: id
      })
    // })
  }

  onSend(message=[]){
    this._sendToDatabase(message[0]);
  }

  _sendToDatabase(message){
    console.log('MESSAGE!', message)
    const {public: profile} = this.props.user
    let updateChat = {
      chatID: this.chatID,
      lastMsg: message.text,
      lastMsgDate: Date.now(),
      lastMsgSender: this.props.uID,
      otherMember: this.contactID,
      otherMemberName: this.contact
    }
    message.createdAt = Date.now();
    message.user.name = `${profile.first_name} ${profile.last_name}`;
    message.user.avatar = this.avatar;


    this.dataRef.child('chats/' + this.chatID+'/directMsgs/').push(message);

    this.dataRef.child('userChats/'+this.props.uID+'/'+this.contactID).set(updateChat);

    updateChat.otherMember = this.props.uID;
    updateChat.otherMemberName = `${profile.first_name} ${profile.last_name}`;
    this.dataRef.child('userChats/'+this.contactID+'/'+this.props.uID).set(updateChat);

  }

  renderBubble(props) {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: FitlyBlueClear,
        },
        left: {
          backgroundColor: '#326fd1',
        }
      }}
    />
  );
}



  renderCustomActions(props) {
    // if (Platform.OS === 'ios') {
    //   return (
    //     <CustomActions
    //       {...props}
    //     />
    //   );
    // }
    const options = {
      'Take a pic': (props) => {
        getImageFromCam(image=>this.photos = image);
      },
      'From Lib': (props) => {
        getImageFromLib(images=>this._uploadPhoto(images));
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  }

  _uploadPhoto(images){
    (async () =>{
      try {
        let authorInfo = {
          author: this.props.uID,
          authorName: this.props.user.public.first_name + ' ' + this.props.user.public.last_name,
          authorPicture: this.props.user.public.picture
        }
        let notifImage;
        let photosRefs = await savePhotoToDB(images, authorInfo, '/chats/' + this.chatID)
        let photoRefObject = photosRefs.reduce((refObj, photoRef)=>{
          if(!notifImage) notifImage=photoRef.link;
            refObj[photoRef.key] = {
              link: photoRef.link,
              timestamp: Firebase.database.ServerValue.TIMESTAMP,
            };
            return refObj;
        }, {});
        let msg = {
          _id: uuid.v4(),
          createdAt: Date.now(),
          text: "",
          user : {
            _id: this.props.uID
          },
          image: photosRefs[0].link,
        }
        this._sendToDatabase(msg)
      } catch(error) {
        console.log('error', error);
      }
    })();
  }

  render(){
    return(
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this._renderHeader()}
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend.bind(this)}
          user={{_id: this.props.uID}}
          renderBubble={this.renderBubble.bind(this)}
          renderActions={this.renderCustomActions.bind(this)}/>
      </View>
    )
  }
}

const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop, push, resetTo }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
