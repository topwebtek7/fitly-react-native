import React, { Component } from 'react';
import { TextInput } from 'react-native';

class AutoExpandingTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0
    };
  }
  render() {
    return (
      <TextInput
        {...this.props}
        underlineColorAndroid={'transparent'}
        onContentSizeChange={event => {
          this.setState({ height: event.nativeEvent.contentSize.height });
        }}
        style={[
          {
            height: Math.max(25, this.state.height),
            flex: 1,
            color: '#fff'
          },
          this.props.style
        ]}
      />
    );
  }
}

export default AutoExpandingTextInput;
