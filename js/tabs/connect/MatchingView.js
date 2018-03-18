import React, { Component } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { loginStyles, loginStylesInverse, feedEntryStyle, alternateBlue, FitlyBlue } from '../../styles/styles.js';
import { matchUser, cancelMatch } from '../../actions/connect.js';
import { pop, replaceRoutes } from '../../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MatchService, createReqObj, TIMEOUT } from '../../library/matchService';
import HeaderInView from '../../header/HeaderInView';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { NavigationActions } from 'react-navigation';

class MatchingView extends Component {
  constructor(props) {
    super(props);
    this.matchService = new MatchService(this._createReqObj());
    this._retryMatch = this._retryMatch.bind(this);
    this._cancelMatch = this._cancelMatch.bind(this);
    this._onMatched = this._onMatched.bind(this);
  }

  componentDidMount() {
    this.props.action.matchUser(this.matchService, this._onMatched);
    this.refs.circularProgress.performLinearAnimation(100, TIMEOUT);
  }

  componentWillUnmount() {
    if (this.props.matchState.matching) {
      this.props.action.cancelMatch(this.matchService);
    }
  }

  _onMatched() {
    this.refs.circularProgress.performLinearAnimation(100, 500);

    setTimeout(() => {
      // this.props.navigation.navigate("SessionView", {
      //   scheduled: false,
      //   sessionID:this.props.matchState.partner.sessionKey,
      //   partner: this.props.matchState.partner
      // })
      
      this._navigateToSessionView();
      // this.props.navigation.dispatch(goToSessionView);
    }, 2000)
  }

  _navigateToSessionView = () => {
    const goToSessionView = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'SessionView', params: {
        scheduled: false,
        sessionID:this.props.matchState.partner.sessionKey,
        partner: this.props.matchState.partner
      }})]
    })

    this.props.navigation.dispatch(goToSessionView);
  }

  _createReqObj() {
    return createReqObj({
      user: this.props.user,
      userid: this.props.uID,
      activityLevel: this.props.matchState.activityLevel,
      workoutType: this.props.matchState.workoutType,
    });
  }

  _retryMatch() {
    this.refs.circularProgress.performLinearAnimation(0, 0);
    this.refs.circularProgress.performLinearAnimation(100, TIMEOUT);
    this.matchService = new MatchService(this._createReqObj());
    this.props.action.matchUser(this.matchService, this._onMatched);
  }

  _cancelMatch() {
    this.refs.circularProgress.performLinearAnimation(0, 500);
    this.props.action.cancelMatch(this.matchService);
    this.props.navigation.goBack();
  }


  _renderHeader() {
    const {matching, matched} = this.props.matchState;
    let title;
    if (matching) {
      title = 'Matching'
    } else {
      title = (matched) ? 'Match Found' : 'Match Not Found';
    };

    return <HeaderInView
      leftElement={{icon: "ios-arrow-round-back-outline"}}
      title={title}
      _onPressLeft={() => this.props.navigation.goBack()}
    />
  }

  _renderMatch() {
    const {matching, matched, partner} = this.props.matchState;
    let center = () => null;
    let description = null;
    let fill = 0;
    if (matching) {
      if (partner) {
        center = () => (
          <View style={styles.centerStyle}>
            <Image source={(partner.picture) ? {uri:partner.picture} : require('../../../img/default-user-image.png')}
              style={{width: 190, height: 190, borderRadius: 95}} defaultSource={require('../../../img/default-user-image.png')}/>
          </View>
        );
        description = (
          <View style={styles.textContainer}>
            <Text style={loginStylesInverse.textMid}>waiting for confirmation</Text>;
          </View>
        )
      } else {
        center = () => (
          <View style={styles.centerStyle}>
            <ActivityIndicator animating={true} style={{height: 80}} size="large"/>
          </View>
        );
        description = (
          <View style={styles.textContainer}>
            <Text style={loginStylesInverse.textMid}>finding you a match...</Text>
          </View>
        )
      }
    } else {
      if (matched && partner) {
        center = () => (
          <View style={styles.centerStyle}>
            <Image source={(partner.picture) ? {uri:partner.picture} : require('../../../img/default-user-image.png')}
            style={{width: 190, height: 190, borderRadius: 95}} defaultSource={require('../../../img/default-user-image.png')}/>
          </View>
        )
        description = (
          <View style={styles.textContainer}>
            <Text style={[styles.blackCenterText, styles.matchName]}>{partner.first_name + ' ' + partner.last_name}</Text>
            <Text style={styles.blackCenterText}>Found A Match</Text>
          </View>
        );
      } else {
        fill = 0;
      }
    }
    return (
      <View style={{marginTop: 30}}>
        <AnimatedCircularProgress
          ref="circularProgress"
          fill={0}
          size={200}
          width={3}
          tintColor={'#42b6f4'}
          backgroundColor={FitlyBlue}>
          {center}
        </AnimatedCircularProgress>
        {description}
        {this._renderError()}
      </View>
    )
  }


  _renderRetryBtn() {
    return (!this.props.matchState.matching && !this.props.matchState.partner)
      ? <TouchableOpacity style={loginStylesInverse.FBbtn} onPress={this._retryMatch}>
        <Text style={loginStylesInverse.btnText}>RETRY</Text>
      </TouchableOpacity>
      : <View/>;
  }

  _renderCancelBtn() {
    return (this.props.matchState.matching)
      ? <TouchableOpacity style={loginStylesInverse.FBbtn} onPress={this._cancelMatch}>
        <Text style={loginStylesInverse.btnText}>CANCEL</Text>
      </TouchableOpacity>
      : null;
  }

  _renderError() {
    const {matching, matched, error} = this.props.matchState;
    return (!matching && error)
      ? <View style={styles.textContainer}>
          <Text style={loginStylesInverse.textMid}>{error}</Text>
        </View>
      : <View/>;
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center'}}>
        {/* {this._renderHeader()} */}
        {this._renderMatch()}
        {/* {this._renderRetryBtn()} */}
        {this._renderCancelBtn()}
      </View>
    );
  }
};

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    user: state.user.user,
    matchState: state.connect,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ matchUser, cancelMatch }, dispatch),
    exnavigation: bindActionCreators({ pop, replaceRoutes }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MatchingView);

const styles = StyleSheet.create({
  centerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginTop: 20,
    maxHeight: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blackCenterText: {
    color: '#333',
    fontSize: 16,
    alignItems: 'center'
  },
  matchName: {
    fontSize: 24,
    color: '#000',
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: '500',
  }
})
