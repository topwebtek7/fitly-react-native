import React, { Component } from 'react';
import { View, ListView, ActivityIndicator } from 'react-native';
import { TabViewAnimated } from 'react-native-tab-view';
import ActivityCalendarPage from './ActivityCalendarPage.js';
import shallowCompare from 'react-addons-shallow-compare';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentPage, setCalendarState } from '../../actions/eventCalendar.js';

class ActivityCalendar extends Component {
  constructor(props) {
    super(props);
    this._handleChangeTab = this._handleChangeTab.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      page: 1,
      loading: false,
      initialLoading: true,
    };
  }

  componentDidMount() {
    this._handleCurrentDayChange();
    setTimeout(() => {
      this.setState({ initialLoading: false });
    }, 2000);
  }

  _handleCurrentDayChange() {
    const calendarState = this.props;
    const timeUntilTmr = new Date().setHours(23,59,59,999) - new Date();
    setTimeout(() => {
      let index = (calendarState.index > 0) ? calendarState.index - 1 : calendarState.index;
      let routes = (calendarState.index > 0) ? calendarState.routes.slice(0, calendarState.routes.length - 1) : calendarState.routes;
      this.props.action.setCalendarState({index, routes})
      this._handleCurrentDayChange();
    }, timeUntilTmr);
  }

  _handleChangeTab = (index) => {
    this.props.action.setCurrentPage(index);
  };

  _renderScene = ({ route }) => {
    return <ActivityCalendarPage key={Math.random()} index={parseInt(route.key)}/>;
  };

  _onEndReached = () => {
    if (this.state.loading) return;
    this.setState({
      page: this.state.page + 1,
      loading: true
    });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 2000);
  }

  _renderRow = rowData => {
    return (
      <ActivityCalendarPage
        index={rowData}
        screenProps={this.props.screenProps}
      />
    );
  }

  _renderFooter = () => {
    if (!this.state.loading) return null;
    return (
      <ActivityIndicator
        style={{ marginBottom: 20 }}
        animating={this.state.loading}
        size="large"
      />
    )
  }

  render() {
    const { page, initialLoading } = this.state;
    return (
      <View style={{flex: 1}}>
        <ListView
          dataSource={this.ds.cloneWithRows(Array(page*10).fill().map((_, i) => i))}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._onEndReached}
          onEndReachedThreshold={10}
          showsVerticalScrollIndicator={false}
          //initialListSize={20}
          //pageSize={20}
        />
        {initialLoading &&
          <ActivityIndicator
            animating
            size="large"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: 'white',
            }}
          />}
      </View>
    );
    return (
      <TabViewAnimated
        ref='eventCalender'
        style={{flex: 1}}
        navigationState={this.props.calendarState}
        renderScene={this._renderScene}
        onRequestChangeTab={this._handleChangeTab}
        shouldOptimizeUpdates={true}
      />
    );
  }
};

const mapStateToProps = function(state) {
  return {
    calendarState: state.eventCalendar,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ setCurrentPage, setCalendarState }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityCalendar);
