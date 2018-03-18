import React, { Component } from 'react';
import { optionStyle, datepickerStyle, FitlyBlue, postStyle } from '../../styles/styles.js';
const FitlyBlueClear = 'rgba(29,47,123,.8)';
import { KeyboardAvoidingView, TouchableOpacity, ScrollView, Text, View, Keyboard, Platform } from 'react-native';
import AutoExpandingTextInput from '../../common/AutoExpandingTextInput';
import Author from '../../common/Author';

const isAndroid = Platform.OS === 'android'

export default class SessionChat extends Component {
  static propTypes: {
    messages: React.PropTypes.array.isRequired,
    onSend: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired,
    containerStyle: React.PropTypes.object,
    listViewProps: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this._onSend = this._onSend.bind(this);
    this.contentHeight = 0;
    this.scrollViewHeight = 0;
    this.state = { text: '' }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.messages.length !== this.props.messages.length) {
      // this._scrollToBottom();
    }
  }

  _onSend() {
    this.props.onSend([{
      _id: Math.random * 100000,
      createdAt: new Date(),
      text: this.state.text,
      user: this.props.user
    }])
    this.setState({text: ''});
  }

  _scrollToBottom(animated = true) {
    const scrollHeight = this.contentHeight - this.scrollViewHeight;
    if (scrollHeight > 0) {
      const scrollResponder = this.refs.sessionChatScrollView.getScrollResponder();
      scrollResponder.scrollResponderScrollTo({x: 0, scrollHeight, animated});
    }
  }

  _renderInputBar() {
    return (
      <KeyboardAvoidingView behavior={'padding'} style={postStyle.inputBar}>
        <AutoExpandingTextInput
          clearButtonMode="always"
          onChangeText={(text) => this.setState({text: text})}
          style={postStyle.replyInput}
          value={this.state.text}
          placeholder="Type a message..."
          placeholderTextColor="grey"
          onSubmitEditing={this._onSend}
          multiline={true}
        />
        <TouchableOpacity style={[postStyle.cameraBtn, {top: 12, right: 0}]} onPress={this._onSend}>
           <Text style={{
              color: '#0084ff',
              fontWeight: '600',
              fontSize: 17,
              backgroundColor: 'transparent',
              marginBottom: 12,
              marginLeft: 10,
              marginRight: 10,
            }}>
            Send
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  _renderBubbleText(msg) {
    const backgroundColor = (msg.user._id === this.props.user._id) ? '#4286f4' : '#e2e2e2';
    const textColor = (msg.user._id === this.props.user._id) ? 'white' : 'black';
    return (
      <View style={{backgroundColor: backgroundColor, margin: 10, justifyContent: 'center', alignItems:'center', borderRadius: 5}}>
        <Text style={{margin: 10, color: textColor}}>{msg.text}</Text>
      </View>
    )
  }

  _renderMsgs(msg) {
    const commonStyle = {flexDirection: 'row'}
    const msgStyle = (msg.user._id === this.props.user._id)
      ? {...commonStyle, alignSelf: 'flex-end'}
      : {...commonStyle}

    const message = (msg.user._id === this.props.user._id)
      ? <View style={msgStyle} key={msg._id}>
        {this._renderBubbleText(msg)}
        <Author screenProps={this.props.screenProps} navigation={this.props.navigation} uID={this.props.user._id} name={msg.user.name} picture={msg.user.avatar} nonClickable={true} showName={false}/>
      </View>
      : <View style={msgStyle} key={msg._id}>
        <Author screenProps={this.props.screenProps} navigation={this.props.navigation} uID={this.props.user._id} name={msg.user.name} picture={msg.user.avatar} nonClickable={true} showName={false}/>
        {this._renderBubbleText(msg)}
      </View>
    return message;
  }

  render() {
    const messageContainerOffset = (this.state.keyboardOn) ? -180 : 0;
    return (
      <View style={[{flex: 1.5, borderWidth: 1}, this.props.containerStyle]}>
        <ScrollView
          keyboardDismissMode={isAndroid ? "none" : "on-drag"}
          contentContainerStyle={{margin: 10, paddingBottom: 50}}
          ref='sessionChatScrollView'
          onContentSizeChange={(w, h) => this.contentHeight = h}
          onLayout={ev => this.scrollViewHeight = ev.nativeEvent.layout.height}
        >
          {(this.props.messages.length)
            ? this.props.messages.map(msg => this._renderMsgs(msg))
            : <Text style={{textAlign: 'center', margin: 50, color: '#ddd'}}>no messages</Text>
          }
        </ScrollView>
        {this._renderInputBar()}
      </View>
    );
  }
}

const chatContainerStyle = {
  alignSelf: 'flex-end',
  bottom: 0,
}
