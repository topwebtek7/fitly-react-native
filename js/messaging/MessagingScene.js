import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, ListView, InteractionManager, StyleSheet, Dimensions, ActivityIndicator } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { pop, push } from '../actions/navigation.js';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderInView from '../header/HeaderInView.js'
import Spinner from 'react-native-loading-spinner-overlay';
import SearchBar from 'react-native-search-box';
import {getWeekdayMonthDay, getHrMinDuration, getDateStringByFormat} from '../library/convertTime.js';


const FitlyBlue = '#1D2F7B';
let screenWidth = Dimensions.get('window').width;

const chat = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  quickView: {
    minHeight: 72,
    flex: 1,
    flexDirection: 'row',
    width: screenWidth-30,
  },
  text: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 72,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  defaultImg: {
    borderRadius: 30,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
    width: 60,
    height: 60,
    borderWidth:2,
    borderColor: FitlyBlue,
    justifyContent: 'center'
  },
  trainerImg: {
    borderRadius: 30,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
    width: 60,
    height: 60,
    borderWidth:2,
    borderColor: '#FF0000',
    justifyContent: 'center'
  },
  proImg: {
    borderRadius: 30,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
    width: 60,
    height: 60,
    borderWidth:2,
    borderColor: 'gold',
    justifyContent: 'center'
  },
  contact:{
    fontSize: 16,
    color: "black"
  },
  message:{
    fontSize: 14,
    color: "gray"
  },
  newChatBtn: {
    alignSelf: 'stretch',
    height: 50,
    borderColor: '#FFFFFF',
    backgroundColor: FitlyBlue,
    justifyContent: 'center',
    bottom: 0,
    position: 'absolute',
    left: 0,
    right: 0
  },
  btnText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white'
  }
})


class MessagingScene extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2)=>r1 !== r2});

    this.state={
      chats: [],
      dataSource: ds.cloneWithRows([]),
      loaded: false,
      search: false,
      searchText: '',
      searchResults: [],
      searchDS: ds.cloneWithRows([]),
    }
    this.blocks = this.props.blocks;
    this.dataRef = this.props.FitlyFirebase.database().ref();
    this.chatRef = this.props.FitlyFirebase.database()
                    .ref('userChats/'+this.props.uID);
    this.typingTimer;
    this.doneTypingInterval = 500;

  }


  componentDidMount() {
    InteractionManager.runAfterInteractions(()=>{
      this._turnOnMessengerListener();
    });
  }

  componentWillUnmount() {
    this._turnOffMessengerListener();
  }

  _turnOnMessengerListener(){
    const resetTimer = ()=>{
      clearTimeout(this.Timer);
      this.Timer = setTimeout(()=>{
        this.setState({
          loaded: true,
          dataSource: this.state.dataSource.cloneWithRows(this.state.chats)
        })
      },500);
    }

    resetTimer();
    this.chatRef.orderByChild('lastMsgDate').on('child_added', (chat)=>{
      let uID = chat.val().otherMember
      if (this.blocks[uID]) return;
      this.dataRef.child('users/'+uID+'/public/').once('value', user=>{
        let u = user.val();
        let chatView = {
          ...chat.val(),
          profilePic: u.picture,
          contactID: uID,
          contact: u.first_name+' '+u.last_name,
          account: u.account,
        }
        this.setState({chats: [chatView, ...this.state.chats]},()=>{
          resetTimer();
        })
      })
    });

    this.chatRef.on('child_changed', chat=>{
      this._updateChat(chat.val());
    })
  }

  _updateChat(chat){
    let chats = this.state.chats;
    let idx;
    let newChat;
    chats.forEach((c,i)=>{
      if (c.chatID === chat.chatID){
        idx = i;
        newChat = Object.assign({}, c, chat);
        return;
      }
    })
    let newChats = [newChat, ...this.state.chats.slice(0,idx), ...this.state.chats.slice(idx+1)]
    this.setState({
      chats: newChats,
      dataSource: this.state.dataSource.cloneWithRows(newChats)
    })
  }

  _turnOffMessengerListener(){
    this.chatRef.off();
  }


  _renderHeader() {
    if(this.state.search){
      return (
        <HeaderInView
          leftElement={{icon: "ios-close"}}
          rightElement={{text: ""}}
          _onPressLeft={() => this.props.navigation.goBack()}
          >
          <View style={{alignSelf: 'flex-start', justifyContent: 'center', height: 80, paddingTop: 12, marginLeft: 50, zIndex: 0}}>
          <SearchBar
            contentWidth={screenWidth - 70}
            middleWidth={(screenWidth - 70)/2}
            ref='searchBar'
            placeholder='Search'
            onFocus={() => this.setState({search: true})}
            onCancel={() => this.setState({search: false})}
            hideBackground={true}
            showsCancelButton={true}
            onChangeText={this._textChange.bind(this)}
            backgroundColor={'transparent'}
            />
          </View>
        </HeaderInView>
      );
    } else {
      return (
        <HeaderInView
          leftElement={{icon: "ios-close"}}
          rightElement={{text: 'search'}}
          title={"Messages"}
          _onPressLeft={() => this.props.navigation.goBack()}
          _onPressRight={() => this.setState({
            search: !this.state.search,
          }, ()=>this.refs.searchBar.focus())}
          />
      );
    }
  };

_searchChats(phrase){
  this.chatRef.once('value').then(data=>{
    if(!data.val()){
      this.setState({
        loaded: true,
        searchResults: [],
        searchDS: this.state.searchDS.cloneWithRows([])
      })
      return;
    }

    let chats = data.val();
    let chatsID = Object.keys(chats).filter(id=>!this.blocks[id]);

    chatsID.forEach(id=>{
      let chat = chats[id];
      if(chat.otherMemberName.indexOf(phrase)>-1 || chat.otherMemberName.indexOf(phrase.toLowerCase())>-1){
        let uID = chat.otherMember;
        let userInfo = {};
        this.dataRef.child('users/'+uID+'/public/').once('value').then(user=>{
          let u = user.val();
          userInfo = {
            profilePic: u.picture,
            contactID: uID,
            contact: u.first_name+' '+u.last_name,
            account: u.account,
          }
          let foundChat = Object.assign({},chat, userInfo)

          let foundChats = [...this.state.searchResults, foundChat]
          this.setState({
            loaded: true,
            searchResults: foundChats,
            searchDS: this.state.searchDS.cloneWithRows(foundChats)
          })
        })
      }
    })
    let msgs = [];
    chatsID.forEach(id=>{
      let chat = chats[id];
      let uID = chat.otherMember;
      let userInfo = {};
      this.dataRef.child('users/'+uID+'/public/').once('value').then(user=>{
        let u = user.val();
        userInfo = {
          profilePic: u.picture,
          contactID: uID,
          contact: u.first_name+' '+u.last_name,
          account: u.account,
        }
      })
      let chatID = chat.chatID;
      this.dataRef.child(`chats/${chatID}/directMsgs`).once('value').then(chatMsgs=>{
        msgs = chatMsgs.val();
        Object.keys(msgs).reverse().forEach(msgID=>{
          let msg = msgs[msgID];
          if (msg.text.indexOf(phrase)>-1 || msg.text.indexOf(phrase.toLowerCase())>-1) {
            let foundChat = Object.assign({},chat, userInfo)
            foundChat.lastMsg = msg.text;
            foundChat.lastMsgDate = msg.createdAt;
            foundChat.specificMsgID = msgID;

            let foundChats = [...this.state.searchResults, foundChat]

            this.setState({
              loaded: true,
              searchResults: foundChats,
              searchDS: this.state.searchDS.cloneWithRows(foundChats)
            })
          }
        })
      })
    })
  })
}

  _textChange(text){
    clearTimeout(this.typingTimer);
    this.setState({
      searchText: text,
      searchResults: [],
    })
    if (text.length) {
      this.typingTimer = setTimeout(()=>{
        this._searchChats(text)
      }, this.doneTypingInterval);
    }
  }

  _renderRow(msg, sectionID, rowID){
    console.log('CHAT!!', msg)
    return (
      <View key={rowID} style={{flex: 1}}>
      <TouchableOpacity
        onPress={this._enterChat.bind(this, msg)}>
          <View style={chat.quickView}>
            <Image
              style={chat[msg.account+"Img"]}
              source={{uri: msg.profilePic}}
              defaultSource={require('../../img/default-user-image.png')}/>
            <View style={chat.text}>
              <Text style={chat.contact}>{msg.contact}</Text>
              <Text style={chat.message}>
                {msg.lastMsgSender === this.props.uID ?
                  <Icon name={'ios-undo'} size={15} color={'grey'}> </Icon> : false}
                  {msg.lastMsg.length>0 ? msg.lastMsg.length>35?`${msg.lastMsg.slice(0,35).trim()}...`:msg.lastMsg
                  :
                    '(image)'}
              </Text>
              <Text style={{position: 'absolute', bottom: 5, right: 0, fontSize: 10}}>{getDateStringByFormat(msg.lastMsgDate, "ddd, MMM D h:mm A")}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _enterChat(msg) {
    console.log('INFO:', msg.chatID)
    this.props.navigation.navigate("Chat", 
      {
        chatID: msg.chatID,
        contactID: msg.contactID,
        profilePic: msg.profilePic,
        contact: msg.contact,
        navigation: this.props.navigation
      }
    );
  };

  _newChat(){
    this.props.navigation.navigate("ChatSearch", {
      uID: this.props.uID,
      user: this.props.user,
      navigation: this.props.navigation,
      blocks: this.blocks,
    })
  }


  render(){
    return (
      <View style={chat.container}>
        {this._renderHeader()}
        {
          this.state.loaded ?
          <ListView
            dataSource={this.state.search ? this.state.searchDS : this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            enableEmptySections={true}
            />
          : <Spinner visible={!this.state.loaded} overlayColor={null} color={'#1D2F7B'} />
        }

        <TouchableOpacity
          style={chat.newChatBtn}
          onPress={this._newChat.bind(this)}>
          <Text style={chat.btnText}>
            New Chat
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

}



const mapStateToProps = function(state) {
  return {
    user: state.user.user,
    uID: state.auth.uID,
    FitlyFirebase: state.app.FitlyFirebase,
    loading: state.app.loading,
    navIndex: state.navState.tabs,
    blocks: state.blocks.blocks,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop, push }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessagingScene);
