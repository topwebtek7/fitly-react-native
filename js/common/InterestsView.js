import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  ScrollView,
  Dimensions,
  Slider,
  Switch,
  Platform,
  ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storeUserProfile } from '../actions/user.js';
import { printError, clearError, setSearchLocation } from '../actions/app.js';
import { push, resetTo } from '../actions/navigation.js';
import { createUpdateObj } from '../library/firebaseHelpers.js';
import { loginStyles, loginStylesInverse } from '../styles/styles';
import SPORTS from '../constants/SPORTS';

class InterestsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interests: null,
      loading: true
    };
  }

  componentWillMount() {
    //console.log("INTEREST-PROPS", this.props);
    this.props.FitlyFirebase.database()
      .ref('interests/' + this.props.uID)
      .once('value')
      .then(data => {
        if (data.val()) {
          this.setState({
            interests: data.val(),
            loading: false
          });
        } else {
          const interests = {};
          for (let sport of SPORTS) {
            interests[sport] = false;
          }
          this.setState({ interests: interests, loading: false });
        }
      })
      .catch(err => {
        console.log('woops!!!', err);
      });
  }

  _handlePress() {
    const { FitlyFirebase } = this.props;
    //TODO: if picture not created yet, direct to picture upload scene
    this.props.action.clearError();
    (async () => {
      try {
        let publicDataUpdates = createUpdateObj(
          '/users/' + this.props.uID + '/public',
          {
            profileComplete: true
          }
        );

        let privateDataUpdates = createUpdateObj(
          '/users/' + this.props.uID + '/private',
          this.props.navigation.state.params
        );

        await this.props.FitlyFirebase.database()
          .ref()
          .update({ ...publicDataUpdates, ...privateDataUpdates });
        const userData = (await FitlyFirebase.database()
          .ref('users/' + this.props.uID)
          .once('value')).val();

        FitlyFirebase.database()
          .ref('interests/' + this.props.uID)
          .update(this.state.interests);

        this.props.action.storeUserProfile(userData);
        this.props.navigation.navigate('TabNavigator');
      } catch (error) {
        this.props.action.printError(error.message);
      }
    })();
  }

  _renderInterests() {
    const width = Dimensions.get('window').width - 60;
    const style = {
      flex: 0.8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: width,
      padding: 10,
      borderColor: '#ccc',
      borderBottomWidth: 0.5
    };
    return SPORTS.map((sport, i) => {
      if (i === 0) style['borderTopWidth'] = 0.5;
      if (i === SPORTS.length - 1) style['borderBottomWidth'] = 0;
      return (
        <View key={sport} style={style}>
          <Text>{sport}</Text>

          {this._renderPickComponent(sport)}
        </View>
      );
    });
  }

  // Either slider or switch
  _renderPickComponent = sportName => {
    const width = Dimensions.get('window').width - 60;
    return Platform.OS === 'android' ? (
      <Switch
        value={this.state.interests[sportName]}
        onValueChange={newValue => {
          this.setState(state => ({
            interests: {
              ...state.interests,
              [sportName]: newValue
            }
          }));
        }}
      />
    ) : (
      <Slider
        style={{ width: 45 }}
        value={0}
        minimumValue={0}
        maximumValue={1}
        step={1}
        onValueChange={() => {
          const interest = {};
          interest[sportName] = !this.state.interests[sportName];
          this.setState({
            interests: {
              ...this.state.interests,
              ...interest
            }
          });
        }}
      />
    );
  };

  componentDidMount() {
    //console.log("INTEREST-PROPS", this.props)
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView contentContainerStyle={loginStylesInverse.container}>
          <View style={[loginStylesInverse.container, { paddingBottom: 60 }]}>
            <Text style={loginStylesInverse.header}>Interests</Text>
            <Text style={loginStylesInverse.textMid}>
              Choosing things you are interested in will help us send you
              notifications that you may want.
            </Text>
            {this.state.loading ? (
              <ActivityIndicator
                animating={true}
                style={{ height: 80 }}
                size="large"
              />
            ) : (
              this._renderInterests()
            )}
          </View>
        </ScrollView>
        <TouchableHighlight
          style={loginStylesInverse.swipeBtn}
          onPress={() => this._handlePress()}
        >
          <Text style={loginStylesInverse.btnText}>FINISH</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    error: state.app.error,
    FitlyFirebase: state.app.FitlyFirebase,
    user: state.user.user
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators(
      { printError, clearError, storeUserProfile, setSearchLocation },
      dispatch
    ),
    exnavigation: bindActionCreators({ push, resetTo }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InterestsView);
