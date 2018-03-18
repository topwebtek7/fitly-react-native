//courtesy of https://github.com/lintonye/react-native-diary/blob/master/transitions/app/MyNavigator.js

import React, {Component} from 'react';
import {
    View,
    NavigationExperimental,
    StyleSheet,
    Animated,
} from 'react-native';

const { Transitioner, Card } = NavigationExperimental;
const { CardStackPanResponder, PagerStyleInterpolator } = Card;

class CrossFadeTransitioner extends Component {
    render() {
        return (
            <Transitioner
              configureTransition={this._configureTransition.bind(this)}
              render={this._render.bind(this)}
              navigationState={this.props.navigationState}
              style={this.props.style}
              />
        )
    }
    _configureTransition() {
        return {
            duration: 500,
            useNativeDriver: false,
        }
    }
    _render(props) {
        const scenes = props.scenes.map(scene => this._renderScene({...props, scene}));
        // const lastScene = scenes[scenes.length - 1];
        return (
            <View style={styles.scenes}>
                {scenes}
            </View>
        )
    }
    _renderScene(props) {
        // const { position, scene, progress, layout } = props;
        // const { index } = scene;
        // const inputRange = [index - 1, index, index + 1];
        // const opacity = position.interpolate({
        //     inputRange,
        //     outputRange: [ 0, 1, 0 ],
        // });

        // let style = {opacity};


        // const opacity = position.interpolate({
        //     inputRange: [index-1, index, index+0.999, index+1],
        //     outputRange: [ 1, 1, 1, 0],
        // });
        //
        // const translateY = position.interpolate({
        //     inputRange: [index-1, index, index+1],
        //     outputRange: [150, 0, 0],
        // })
        //
        // let style = {opacity, transform: [{translateY}]};


        const panHandlersProps = {
          ...props,
          gestureResponseDistance: 30,
        };

        panHandlers = CardStackPanResponder.forHorizontal(panHandlersProps);
        let style = PagerStyleInterpolator.forHorizontal(props);

        return (
            <Animated.View
              // {...panHandlers}
              key={props.scene.route.key}
              style={[style, styles.scene]}>
                {this.props.renderScene(props)}
            </Animated.View>
        )
    }
}

//<View
  // panHandlers={panHandlers}
  // key={props.scene.route.key}
  // style={[styles.scene]}>
  // {this.props.renderScene({scene: {route: {key: 'Profile'}}})}
//</View>


const styles = StyleSheet.create({
    scenes: {
        flex: 1,
    },
    scene: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
})

export default CrossFadeTransitioner;
