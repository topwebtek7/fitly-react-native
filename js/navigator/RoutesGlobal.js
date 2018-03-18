import WelcomeView from '../login/WelcomeView.js';
import SignUpView from '../login/SignUpView.js';
import SignInView from '../login/SignInView.js';
import VerifyEmailView from '../login/VerifyEmailView.js';
import { SetupProfileView, SetupStatsView, SetupActiveLevelView, SetupLocationView  } from '../login/SetupView.js';
import OnBoardingSlides from '../login/OnBoardingSlides.js';
import TabNavigator from './TabNavigator.js';
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

const ROUTES = {
  WelcomeView: WelcomeView,
  SignInView: SignInView,
  SignUpView: SignUpView,
  SetupProfileView: SetupProfileView,
  SetupStatsView: SetupStatsView,
  SetupActiveLevelView: SetupActiveLevelView,
  SetupLocationView: SetupLocationView,
  TabNavigator: TabNavigator,
  SettingsMenu: SettingsMenu,
  MakePost: MakePost,
  ComposePost: ComposePost,
  OnBoardingSlides: OnBoardingSlides,
  CreateActivityScene: CreateActivityScene,
  SelectDateScene: SelectDateScene,
  SelectLocationScene: SelectLocationScene,
  SelectAdminsScene: SelectAdminsScene,
  SelectInvitesScene: SelectInvitesScene,
  SelectContactScene: SelectContactScene,
  VerifyEmailView: VerifyEmailView,
  EventOptionsMenu: EventOptionsMenu,
  LocationPicker: LocationPicker,
  MessagingScene: MessagingScene,
  Chat: Chat,
  ChatSearch: ChatSearch,
  ActivityLevel: ActivityLevel,
  MatchingView: MatchingView,
  Connect: Connect,
  SessionView: SessionView,
  UserListView: UserListView,
  InterestsView: InterestsView,
  TrainerListView: TrainerListView,
};

export default ROUTES;
