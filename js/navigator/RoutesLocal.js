import Profile from '../tabs/profile/Profile.js';
import Activity from '../tabs/activity/Activity.js';
import Search from '../tabs/search/Search.js';
import Notification from '../tabs/notification/Notification.js';
import Connect from '../tabs/connect/Connect.js';

import ProfileEntry from '../common/ProfileEntry.js';
import PostView from '../common/post/PostView.js';
import ImageView from '../common/ImageView.js';
import PostImagesView from '../common/PostImagesView.js';
import EventScene from '../common/activity/EventScene.js';
import SessionListView from '../common/workoutSession/SessionListView.js';
import TaggedView from '../common/TaggedView.js';

import UserListView from '../common/UserListView.js';
import ReportScene from '../common/ReportScene.js';


const ROUTES = {
  Profile: Profile,
  Activity: Activity,
  Search: Search,
  Notification: Notification,
  Connect: Connect,
  ProfileEntry: ProfileEntry,
  PostView: PostView,
  ImageView: ImageView,
  PostImagesView: PostImagesView,
  EventScene: EventScene,
  SessionListView: SessionListView,
  TaggedView: TaggedView,
  UserListView: UserListView,
  ReportScene: ReportScene,
};

export default ROUTES;
