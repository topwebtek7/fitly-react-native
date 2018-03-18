import React, { Component } from 'react';
import { composeStyle, headerStyle } from '../styles/styles.js';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const isAndroid = Platform.OS === 'android';

class HeaderInView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { leftElement, title, rightElement, _onPressLeft, _onPressRight, customStyles } = this.props;
    let left, right, leftBtn, rightBtn, center;
    if (leftElement && leftElement.icon) {
      left = (<Icon name={leftElement.icon} size={50} color="white"/>);
    } else if (leftElement && leftElement.text) {
      left = (<Text style={headerStyle.text}>{leftElement.text}</Text>);
    }

    if (rightElement && rightElement.icon) {
      right = (<Icon name={rightElement.icon} size={30} color="white"/>);
    } else if (rightElement && rightElement.text) {
      right = (<Text style={headerStyle.text}>{rightElement.text}</Text>);
    }

    if (left) {
      leftBtn = (
        // <TouchableOpacity style={[headerStyle.closeBtn, {position: 'absolute', left: 0, top: isAndroid ? 10 : 20}]} onPress={() => _onPressLeft()}>
        <TouchableOpacity style={[headerStyle.closeBtn, {position: 'absolute', left: 0, top: 0}]} onPress={() => _onPressLeft()}>
          {left}
        </TouchableOpacity>
      );
    }

    if (right) {
      rightBtn = (
         <TouchableOpacity style={{position: "absolute", right: 20, top: isAndroid ? 10 : 20}} onPress={() => _onPressRight()}>
          {/* <View style={{padding: 10}}> */}
          {/* <View style={{paddingTop: isAndroid ? 10 : 17}}> */}
          <View style={{paddingTop: isAndroid ? 10 : 17}}>
            {right}
          </View>
        </TouchableOpacity>
      );
    }

    if (title) {
      center = (
        <Text style={headerStyle.titleText}>
          {title}
        </Text>
      );
    } else {
      center = this.props.children;
    }

    return (
      <View style={[headerStyle.inlineHeader, customStyles || {}]}>
        {leftBtn}
        {center}
        {rightBtn}
      </View>
    );
  }
};

// HeaderInView.propTypes = {
//   leftElement: React.PropTypes.shape({
//     icon: React.PropTypes.string,
//     text: React.PropTypes.string,
//   }),
//   title: React.PropTypes.string,
//   rightElement: {
//     icon: React.PropTypes.string,
//     text: React.PropTypes.string,
//   },
//   _onPressLeft: React.PropTypes.func,
//   _onPressRight: React.PropTypes.func,
//   customStyles: React.PropTypes.object
// }


export default HeaderInView;
