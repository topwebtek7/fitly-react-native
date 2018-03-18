/**
 * @flow
 */

import React, { Component } from 'react';
import {
  StatusBar,
  TextInput,
  TouchableHighlight,
  Text,
  View,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Slider,
  ActivityIndicator,
  ScrollView,
  Picker,
  Platform
} from 'react-native';
import SimplePicker from 'react-native-simple-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { storeUserProfile } from '../actions/user.js';
import {
  printError,
  setLoadingState,
  clearError,
  setSearchLocation
} from '../actions/app.js';
import { push, resetTo } from '../actions/navigation.js';
import FMPicker from 'react-native-fm-picker';
import DatePicker from 'react-native-datepicker';
const dismissKeyboard = require('dismissKeyboard');
const options = ['Male', 'Female'];
import {
  loginStylesInverse,
  loadingStyle,
  commonStyle,
  FitlyBlue
} from '../styles/styles.js';
import {
  getCurrentPlace,
  getPlaceByName
} from '../library/asyncGeolocation.js';
import { createUpdateObj } from '../library/firebaseHelpers.js';

const isAndroid = Platform.OS === 'android';

class SetupProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gender: null,
      birthday: null
    };
    this.props.action.setLoadingState(false);
  }

  formatDate(date) {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  _handlePress() {
    //TODO validate the input before pushing to next scene
    if (this.state.gender !== null && this.state.birthday !== null) {
      this.props.action.clearError();
      this.props.navigation.navigate('InterestsView', { ...this.state });
    } else {
      //TODO: print proper errors
      this.props.action.printError('field cannot be empty');
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => dismissKeyboard()}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView contentContainerStyle={loginStylesInverse.container}>
            <View style={loginStylesInverse.container}>
              <StatusBar barStyle="default" />
              <Text style={loginStylesInverse.header}>YOUR PROFILE</Text>
              <Text style={loginStylesInverse.textMid}>
                Your stats help us find and suggest goals and workouts for you.
                This information will never be made public.
              </Text>

              <View style={[loginStylesInverse.form, { alignItems: 'center' }]}>
                <View>
                  <Text style={loginStylesInverse.input}>
                    Please select Your gender
                  </Text>
                  <View
                    style={{
                      width: 250,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text
                      style={{
                        color: '#006381',
                        textAlign: 'center',
                        marginLeft: 15
                      }}
                      onPress={() => {
                        this.refs.picker.show();
                      }}
                    >
                      {this.state.gender
                        ? 'I am a ' + this.state.gender
                        : 'I am a male or a female'}
                    </Text>
                    <SimplePicker
                      ref={'picker'}
                      initialOptionIndex={0}
                      options={options}
                      style={{ backgroundColor: 'black' }}
                      onSubmit={option => {
                        this.setState({
                          gender: option
                        });
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={loginStylesInverse.form}>
                <Text style={loginStylesInverse.input}>I was born on...</Text>
                <DatePicker
                  style={{ width: 200, alignSelf: 'center' }}
                  date={this.state.birthday}
                  mode="date"
                  placeholder="date"
                  format="YYYY-MM-DD"
                  minDate="1800-01-01"
                  maxDate={this.formatDate(new Date())}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  onDateChange={date => {
                    this.setState({ birthday: date });
                  }}
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0
                    },
                    dateInput: {
                      marginLeft: 36,
                      borderWidth: 0
                    },
                    dateText: {
                      color: FitlyBlue
                    },
                    btnCancel: {},
                    btnTextConfirm: {
                      color: '#007AFF'
                    }
                  }}
                />
              </View>
              {this.props.error ? (
                <Text style={commonStyle.error}> {this.props.error} </Text>
              ) : (
                <Text style={commonStyle.hidden}> </Text>
              )}
            </View>
          </ScrollView>
          <TouchableHighlight
            style={loginStylesInverse.swipeBtn}
            onPress={() => this._handlePress()}
          >
            <Text style={loginStylesInverse.btnText}>SAVE & CONTINUE</Text>
          </TouchableHighlight>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class SetupStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: null,
      weight: null,
      ...this.props.navigation.state.params
    };
  }

  _handlePress() {
    //TODO validate input
    this.props.action.clearError();
    if (this.state.height !== null && this.state.weight !== null) {
      //  oldNav: ({
      //    key:'SetupActiveLevelView',
      //    global: true,
      //    passProps: this.state,
      //    from:'SetupStatsView, profile incomplete'
      //  });
      this.props.navigation.navigate(
        'SetupActiveLevelView',
        this.state /* props */
      );
    } else {
      //TODO: print proper errors
      this.props.action.printError('field cannot be empty');
    }
  }

  focusNextField = nextField => {
    this.refs[nextField].focus();
  };

  render() {
    return (
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => dismissKeyboard()}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView contentContainerStyle={loginStylesInverse.container}>
            <View style={loginStylesInverse.container}>
              <StatusBar barStyle="default" />
              <Text style={loginStylesInverse.header}>YOUR STATS</Text>
              <Text style={loginStylesInverse.textMid}>
                Your stats help us find and suggest goals and workouts for you.
                This information will never be made public.
              </Text>
              <View style={loginStylesInverse.form}>
                <TextInput
                  underlineColorAndroid={'transparent'}
                  returnKeyType="next"
                  maxLength={30}
                  clearButtonMode="always"
                  ref="1"
                  onSubmitEditing={() => this.focusNextField('2')}
                  style={loginStylesInverse.input}
                  onChangeText={text => this.setState({ height: text })}
                  value={this.state.height}
                  placeholder="Height"
                  placeholderTextColor={FitlyBlue}
                />
              </View>
              <View style={loginStylesInverse.form}>
                <TextInput
                  underlineColorAndroid={'transparent'}
                  ref="2"
                  onSubmitEditing={() => this._handlePress()}
                  style={loginStylesInverse.input}
                  onChangeText={text => this.setState({ weight: text })}
                  value={this.state.weight}
                  placeholder="Weight"
                  placeholderTextColor={FitlyBlue}
                />
              </View>
              {this.props.error ? (
                <Text style={commonStyle.error}> {this.props.error} </Text>
              ) : (
                <Text style={commonStyle.hidden}> </Text>
              )}
            </View>
          </ScrollView>
          <TouchableHighlight
            style={loginStylesInverse.swipeBtn}
            onPress={() => this._handlePress()}
          >
            <Text style={loginStylesInverse.btnText}>SAVE & CONTINUE</Text>
          </TouchableHighlight>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class SetupActiveLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLevel: 0,
      ...this.props.navigation.state.params
    };
  }

  _handlePress() {
    this.props.action.clearError();
    if (this.state.activeLevel !== null) {
      this.props.navigation.navigate('SetupLocationView', this.state);
      //  Old Nav: ({
      //    key:'SetupLocationView',
      //    global: true,
      //    passProps: this.state,
      //    from:'SetupActiveLevelView, profile incomplete'
      //  });
    } else {
      //TODO: print proper errors
      this.props.action.printError('field cannot be empty');
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => dismissKeyboard()}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView contentContainerStyle={loginStylesInverse.container}>
            <View style={loginStylesInverse.container}>
              <StatusBar barStyle="default" />
              <Text style={loginStylesInverse.header}>ACTIVITY LEVEL</Text>
              <Text style={loginStylesInverse.textMid}>
                Your stats help us find and suggest goals and workouts for you.
                This information will never be made public.
              </Text>

              <View style={[loginStylesInverse.form, { borderBottomWidth: 0 }]}>
                <Text style={loginStylesInverse.input}>
                  Choose a level of activity...
                </Text>
              </View>

              <Slider
                style={{ width: 260, alignSelf: 'center' }}
                value={this.state.activeLevel}
                minimumValue={0}
                maximumValue={10}
                step={0.5}
                onValueChange={value => this.setState({ activeLevel: value })}
              />

              <Text
                style={[
                  loginStylesInverse.input,
                  { marginTop: 40, fontSize: 40 }
                ]}
              >
                {this.state.activeLevel}
              </Text>
              {this.props.error ? (
                <Text style={commonStyle.error}> {this.props.error} </Text>
              ) : (
                <Text style={commonStyle.hidden}> </Text>
              )}
            </View>
          </ScrollView>
          <TouchableHighlight
            style={loginStylesInverse.swipeBtn}
            onPress={() => this._handlePress()}
          >
            <Text style={loginStylesInverse.btnText}>SAVE & CONTINUE</Text>
          </TouchableHighlight>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class SetupLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      location: null,
      locationInput: null
    };
  }

  _handlePress() {
    const { FitlyFirebase } = this.props;
    //TODO: if picture not created yet, direct to picture upload scene
    this.props.action.clearError();
    if (this.state.location) {
      (async () => {
        try {
          this.props.navigation.navigate('OnBoardingSlides');

          let publicDataUpdates = createUpdateObj(
            '/users/' + this.props.uID + '/public',
            {
              userLocation: this.state.location,
              userCurrentLocation: this.state.location,
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
          this.props.action.storeUserProfile(userData);
          const coordinate = {
            coordinate: userData.public.userCurrentLocation.coordinate
          };
          this.props.action.setSearchLocation(coordinate);
        } catch (error) {
          this.props.action.printError(error.message);
        }
      })();
    } else {
      //TODO: show proper error
      this.props.action.printError('location error');
    }
  }

  _getLocation(input) {
    let getLocationFunc = input
      ? getPlaceByName.bind(null, input)
      : getCurrentPlace;
    this.props.action.clearError();
    (async () => {
      try {
        this.setState({ loading: true });
        const place = await getLocationFunc();
        this.setState({
          loading: false,
          location: {
            place: `${place.locality}, ${place.adminArea}`,
            coordinate: {
              lat: place.position.lat,
              lon: place.position.lng
            },
            zip: place.postalCode
          }
        });
      } catch (error) {
        this.props.action.printError(error);
        console.log('geolocation error', error);
      }
    })();
  }

  render() {
    return (
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => dismissKeyboard()}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <ScrollView contentContainerStyle={loginStylesInverse.container}>
            <View style={loginStylesInverse.container}>
              <StatusBar barStyle="default" />
              <Text style={loginStylesInverse.header}>LOCATION</Text>
              <Text style={loginStylesInverse.textMid}>
                Please enter your location so we can find activities, events,
                and friends in your area.
              </Text>

              <TouchableHighlight
                style={loginStylesInverse.FBbtn}
                onPress={() => this._getLocation()}
              >
                <Text style={loginStylesInverse.btnText}>
                  USE CURRENT LOCATION
                </Text>
              </TouchableHighlight>

              <Text style={loginStylesInverse.textSmall}>or</Text>

              <View style={loginStylesInverse.form}>
                <TextInput
                  underlineColorAndroid={'transparent'}
                  maxLength={30}
                  returnKeyType="search"
                  clearButtonMode="always"
                  onSubmitEditing={() =>
                    this._getLocation(this.state.locationInput)
                  }
                  style={loginStylesInverse.input}
                  onChangeText={text => this.setState({ locationInput: text })}
                  value={this.state.locationInput}
                  placeholder="Enter postal code, or city"
                  placeholderTextColor={FitlyBlue}
                />
              </View>

              <Text
                style={[
                  loginStylesInverse.input,
                  { marginTop: 40, fontSize: 30 }
                ]}
              >
                {this.state.location && this.state.location.place
                  ? this.state.location.place
                  : ''}
              </Text>
              {this.props.error ? (
                <Text style={commonStyle.error}> {this.props.error} </Text>
              ) : (
                <Text style={commonStyle.hidden}> </Text>
              )}
              <ActivityIndicator
                animating={this.state.loading}
                style={{ height: 80 }}
                size="large"
              />
            </View>
          </ScrollView>
          <TouchableHighlight
            style={loginStylesInverse.swipeBtn}
            onPress={() => this._handlePress()}
          >
            <Text style={loginStylesInverse.btnText}>FINISH</Text>
          </TouchableHighlight>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    error: state.app.error,
    FitlyFirebase: state.app.FitlyFirebase
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators(
      {
        printError,
        clearError,
        storeUserProfile,
        setLoadingState,
        setSearchLocation
      },
      dispatch
    ),
    exnavigation: bindActionCreators({ push, resetTo }, dispatch)
  };
};

export const SetupProfileView = connect(mapStateToProps, mapDispatchToProps)(
  SetupProfile
);
export const SetupStatsView = connect(mapStateToProps, mapDispatchToProps)(
  SetupStats
);
export const SetupActiveLevelView = connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupActiveLevel);
export const SetupLocationView = connect(mapStateToProps, mapDispatchToProps)(
  SetupLocation
);
