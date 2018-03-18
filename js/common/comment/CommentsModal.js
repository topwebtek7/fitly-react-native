import React, { Component } from 'react';
import { Modal, View } from 'react-native';
import CommentsView from './CommentsView';

import ComposeComment from './ComposeComment.js';
import ParentView from './ParentView.js';

//this is the main component for displaying comments for all kinds content types,
//it uses a route stack to decide what content is currently focused and display the comments for that content
export default class CommentsModal extends Component {
  constructor(props) {
    super(props);
    let initialRouteStack = this.props.initialRoute
      ? [this.props.initialRoute]
      : [];
    this.isPrivateContent =
      this.props.initialRoute && this.props.initialRoute.isPrivateContent
        ? this.props.initialRoute.isPrivateContent
        : false;
    this.state = {
      routeStack: initialRouteStack,
      skipInititalRoute: false
    };

    this._renderParent = this._renderParent.bind(this);
    this._renderChild = this._renderChild.bind(this);
  }

  _pushRoute(route) {
    let newRoutes = this.state.routeStack.slice();
    newRoutes.push(route);
    this.setState({ routeStack: newRoutes });
  }

  _popRoute() {
    const pop = () => {
      let newRoutes = this.state.routeStack.slice();
      newRoutes.pop();
      this.setState({ routeStack: newRoutes });
    };

    let minStackSize = this.state.skipInititalRoute ? 2 : 1;
    if (this.state.routeStack.length > minStackSize) {
      pop();
    } else {
      if (this.state.skipInititalRoute) {
        this.setState({ skipInititalRoute: false });
        pop();
      }
      this.props.closeModal();
    }
  }

  _renderParent(latestRoute) {
    return (
      <ParentView
        route={latestRoute}
        isPrivateContent={this.isPrivateContent}
        pushRoute={this._pushRoute.bind(this)}
        navigation={this.props.navigation}
      />
    );
  }

  _renderChild(latestRoute) {
    return (
      <CommentsView
        screenProps={this.props.screenProps}
        navigation={this.props.navigation}
        route={latestRoute}
        isPrivateContent={this.isPrivateContent}
        pushRoute={this._pushRoute.bind(this)}
      />
    );
  }

  render() {
    const stackSize = this.state.routeStack.length;
    const latestRoute = this.state.routeStack[this.state.routeStack.length - 1];
    return (
      <View>
        <Modal
          animationType={'none'}
          transparent={false}
          visible={!!this.props.modalVisible}
          onRequestClose={() => this._popRoute()}
        >
          <ComposeComment
            navigation={this.props.navigation}
            screenProps={this.props.screenProps}
            contentInfo={latestRoute}
            isPrivateContent={this.isPrivateContent}
            pushRoute={this._pushRoute.bind(this)}
            closeModal={() => this._popRoute()}
            goBackName={this.props.goBackName}
          />
        </Modal>
        {!this.props.disableCommentOnStart ? (
          <CommentsView
            screenProps={this.props.screenProps}
            navigation={this.state.navigation}
            route={this.props.initialRoute}
            openModal={() => {
              this.setState({ skipInititalRoute: true });
              this.props.openModal();
            }}
            isPrivateContent={this.isPrivateContent}
            pushRoute={this._pushRoute.bind(this)}
          />
        ) : null}
      </View>
    );
  }
}

// let routeExample = {
//   contentType: 'type',
//   contentID: 'ID',
//   parentAuthor: 'uID',
// }

CommentsModal.propTypes = {
  modalVisible: React.PropTypes.bool,
  renderParent: React.PropTypes.func,
  closeModal: React.PropTypes.func,
  initialRoute: React.PropTypes.object
};
