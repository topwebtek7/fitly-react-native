import React, { Component } from 'react';
import {StatusBar, View, Image, Text, Dimensions, TouchableHighlight} from 'react-native';
import {loginStyles, FitlyBlue} from '../styles/styles.js'
import Carousel from 'react-native-looped-carousel';
import { resetTo } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationActions } from 'react-navigation';
const { width, height } = Dimensions.get('window');



const Slide = (props) => {
  return (
    <View>
      <Image
        style={{width: width}}
        source={props.image}
        defaultSource={require('../../img/default-photo-image.png')}/>
      <View style={{flex: 0, left: 0, right: 0, width: width, height:height/3, backgroundColor: FitlyBlue, alignItems: 'center', justifyContent:'center'}}>
        <Text style={{top: -20, color: 'white', fontFamily: 'HelveticaNeue', letterSpacing: .8, fontWeight: '400', fontSize: 18, textAlign:'center', marginLeft: 15, marginRight: 15}}>{props.text}</Text>
      </View>
    </View>
  );
};

class OnBoadingSlides extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: { width, height },
      slideLength: 4,
      currentSlide: 0
    };
  }

  _onLayoutDidChange = (e) => {
    const layout = e.nativeEvent.layout;
    this.setState({ size: { width: layout.width, height: layout.height } });
  }

  _resetToSignIn = () => {
    const resetActions = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate("SignInView")
      ]
    })
    this.props.navigation.dispatch(resetActions)
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }} onLayout={this._onLayoutDidChange}>
        <StatusBar barStyle="dark-content"/>
        <Carousel
          bulletsContainerStyle={{left:0, right:0, position:'absolute', bottom: 50, zIndex: 2}}
          bulletStyle={{margin: 5, width: 8, height: 8, borderWidth:0, backgroundColor: 'rgba(255,255,255,.30)'}}
          chosenBulletStyle={{margin: 5, width: 8, height: 8, borderWidth:0}}
          style={this.state.size}
          bullets={true}
          autoplay={false}
          contentContainerStyle={{alignItems: 'flex-end'}}
          onAnimateNextPage={(cb)=>this.setState({currentSlide: cb})}
        >
          <Slide
            image={require('../../img/slide01.png')}
            text={'Personalize Fitly to meet your fitness goals with exlusive workouts and fitness tips uploaded daily.'}
            btnText={'NEXT'}
          />
          <Slide
            image={require('../../img/slide02.png')}
            text={'Find people in your area that share common fitness goals. Meetup to workout and motivate each other.'}
            btnText={'NEXT'}
          />
          <Slide
            image={require('../../img/slide03.png')}
            text={'Discover activities and events around you to keep it sporty and social.'}
            btnText={'NEXT'}
          />
          <Slide
            image={require('../../img/slide04.png')}
            text={'Track your progress and push each other to take it to the next level.'}
          />
        </Carousel>
        { this.state.currentSlide === 3 ?
          <TouchableHighlight
            style={loginStyles.swipeBtn}
            onPress={this._resetToSignIn}>
            <Text style={loginStyles.btnText}>
              FINISH
            </Text>
          </TouchableHighlight>
          : null }
      </View>
    );
  }
};

const mapDispatchToProps = function(dispatch) {
 return {
   exnavigation: bindActionCreators({ resetTo }, dispatch)
 };
}

 export default connect(() => { return {} }, mapDispatchToProps)(OnBoadingSlides);
