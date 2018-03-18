/* @flow */
import React, { Component } from 'react';
import { View, Button } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { pop } from '../actions/navigation.js';

import { StackNavigator, TabNavigator } from 'react-navigation';

import WelcomeView from '../login/WelcomeView.js';
import SignUpView from '../login/SignUpView.js';
import SignInView from '../login/SignInView.js';
import VerifyEmailView from '../login/VerifyEmailView.js';
import {
  SetupProfileView,
  SetupStatsView,
  SetupActiveLevelView,
  SetupLocationView,
} from '../login/SetupView.js';
import OnBoardingSlides from '../login/OnBoardingSlides.js';
import { default as OldTabNavigationScreen } from './TabNavigator.js';
import SettingsMenu from '../settings/SettingsMenu.js';
import MakePost from '../common/post/MakePost.js';
import ComposePost from '../common/post/ComposePost.js';
import CreateActivityScene from '../common/activity/CreateActivityScene.js';
import SelectDateScene from '../common/activity/SelectDateScene.js';
import SelectLocationScene from '../common/activity/SelectLocationScene.js';
import SelectInvitesScene from '../common/activity/SelectInvitesScene.js';
import SelectAdminsScene from '../common/activity/SelectAdminsScene.js';
import SelectContactScene from '../common/activity/SelectContactScene.js';
import EventOptionsMenu from '../common/activity/EventOptionsMenu.js';
import LocationPicker from '../common/LocationPicker.js';
import ChatSearch from '../messaging/ChatSearch.js';
import MessagingScene from '../messaging/MessagingScene.js';
import Chat from '../messaging/Chat.js';
import ActivityLevel from '../tabs/connect/ActivityLevel.js';
import MatchingView from '../tabs/connect/MatchingView.js';
import Connect from '../tabs/connect/Connect.js';
import SessionView from '../common/workoutSession/SessionView.js';
import UserListView from '../common/UserListView.js';
import InterestsView from '../common/InterestsView';
import TrainerListView from '../common/TrainerListView';
import ReportScene from '../common/ReportScene';
import EventScene from '../common/activity/EventScene';
import SessionListView from '../common/workoutSession/SessionView'

import NewTabNavigation from './_TabNavigation';

const ROUTES = {
  WelcomeView: { screen: WelcomeView },
  SignUpView: { screen: SignUpView },
  SignInView: { screen: SignInView },
  SetupProfileView: { screen: SetupProfileView },
  SetupStatsView: { screen: SetupStatsView },
  SetupActiveLevelView: { screen: SetupActiveLevelView },
  SetupLocationView: { screen: SetupLocationView },
  // TabNavigator: { screen: TabNavigationScreen }, /* Main entry for Profile */
  TabNavigator: {screen: NewTabNavigation},
  SettingsMenu: { screen: SettingsMenu },
  MakePost: { screen: MakePost },
  ComposePost: { screen: ComposePost },
  OnBoardingSlides: { screen: OnBoardingSlides },
  CreateActivityScene: { screen: CreateActivityScene },
  SelectDateScene: { screen: SelectDateScene },
  SelectLocationScene: { screen: SelectLocationScene },
  SelectAdminsScene: { screen: SelectAdminsScene },
  SelectInvitesScene: { screen: SelectInvitesScene },
  SelectContactScene: { screen: SelectContactScene },
  VerifyEmailView: { screen: VerifyEmailView },
  LocationPicker: { screen: LocationPicker },
  MessagingScene: { screen: MessagingScene },
  Chat: { screen: Chat },
  ChatSearch: { screen: ChatSearch },
  ActivityLevel: { screen: ActivityLevel },
  MatchingView: { screen: MatchingView },
  Connect: { screen: Connect },
  SessionView: { screen: SessionView },
  UserListView: { screen: UserListView },
  InterestsView: { screen: InterestsView },
  TrainerListView: { screen: TrainerListView },
  ReportScene: { screen: ReportScene },
  EventScene: { screen: EventScene },
  EventOptionsMenu: { screen: EventOptionsMenu },
  SessionListView: { screen: SessionListView }
};

const AppLoginScreen = StackNavigator(ROUTES, {
  headerMode: 'none',
  initialRouteName: "WelcomeView"
});


export default AppLoginScreen;
