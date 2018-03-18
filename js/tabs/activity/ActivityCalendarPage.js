import React, { Component } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  ListView,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from '../../actions/navigation.js';
import { getDateStringByFormat } from '../../library/convertTime.js';
import ActivitySearchResultEntry from './ActivitySearchResultEntry.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UPDATE_INTERVAL = 2 * 60 * 60 * 1000;

class ActivityCalendarPage extends Component {
  constructor(props) {
    super(props);
    this.eventDataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = {
      eventData: this.eventDataSource.cloneWithRows([]),
      loading: true,
      page: 0,
      refreshing: false,
    };
    this._renderDateLabel = this._renderDateLabel.bind(this);
    this.database = this.props.FitlyFirebase.database();
    this._onRefresh = this._onRefresh.bind(this);
  }

  // TODO: clean up nested callbacks
  componentDidMount() {
    //this._fetchAndScheduleExpiration();
    setTimeout(() => this._fetchAndScheduleExpiration(), this.props.index*10);
    this._updater(UPDATE_INTERVAL, newData => {
      if (this.expireTimer) {
        clearTimeout(this.expiratorTimer);
      }
      this.setState(
        {
          eventData: this.state.eventData.cloneWithRows(newData),
        },
        () => {
          this._startEventExpirator(this.state.eventData, cleanedData => {
            this.setState({
              eventData: this.state.eventData.cloneWithRows(cleanedData),
            });
          });
        }
      );
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.calendarState.index !== this.props.index) {
      return;
    }
    this.setState({ page: 0 }, () => {
      this._fetchAndScheduleExpiration();
    });
  }

  componentWillUnmount() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    if (this.expireTimer) clearTimeout(this.expireTimer);
  }

  _fetchAndScheduleExpiration(page = 0, callback) {
    this._fetchEventData(this._getCurrentPageDate())
      .then(data => {
        const newEventData = page
          ? this.state.eventData.cloneWithRows(
              this.state.eventData._dataBlob.s1.concat(data)
            )
          : this.state.eventData.cloneWithRows(data);
        this.setState({ eventData: newEventData }, () => {
          if (this.expireTimer) {
            clearTimeout(this.expiratorTimer);
          }
          this._startEventExpirator(
            this.state.eventData._dataBlob.s1,
            cleanedData => {
              this.setState({
                eventData: this.state.eventData.cloneWithRows(cleanedData),
              });
            }
          );
          callback && callback();
        });
      })
      .catch(err => {
        this.setState(state => ({ loading: false }));
      });
  }

  _getCurrentPageDate() {
    return new Date(new Date().getTime() + MS_PER_DAY * this.props.index);
  }

  _fetchEventData(date) {
    this.setState({ loading: true });
    const timeRangeForDay = this._createTimeRangeForDay(date);
    const queryBody = {
      sort: [{ startDate: { order: 'asc' } }, { memberCount: 'asc' }, '_score'],
      query: {
        filtered: {
          filter: {
            bool: {
              must: [
                {
                  term: {
                    isPublic: true,
                  },
                },
                {
                  range: {
                    startDate: {
                      gte: timeRangeForDay[0],
                      lte: timeRangeForDay[1],
                    },
                  },
                },
              ],
              filter: {
                geo_distance: {
                  distance: `${Math.floor(
                    this.props.searchLocation.radius / 1609.34
                  ) *
                    8 /
                    5}km`,
                  'location.coordinate': this.props.searchLocation.coordinate,
                },
              },
            },
          },
        },
      },
    };
    const fetchSize = 8;
    const query = {
      index: 'firebase',
      type: 'event',
      size: fetchSize,
      from: this.state.page * fetchSize,
      body: JSON.stringify(queryBody), // because there is '.' in the object, it cannot be a valid json, therefore must first be stringify, see: https://github.com/firebase/flashlight/issues/91
    };

    return new Promise((resolve, reject) => {
      const key = this.database.ref('/search/request').push(query).key;
      this.database
        .ref(`/search/response/${key}`)
        .on('value', showResults.bind(this));
      function showResults(snap) {
        if (!snap.exists()) {return;}
        snap.ref.off('value', showResults);
        snap.ref.remove();
        const results = snap.val().hits;
        if (!results || !results.hits) {
          this.setState({ page: this.state.page - 1 });
          reject(new Error('no more results found'));
        } else {
          resolve(results && results.hits);
        }
        this.setState({ loading: false });
      }
    });
  }

  _createTimeRangeForDay(date) {
    let startDate;
    if (date > new Date()) {
      startDate = new Date(date.getTime()).setHours(0, 0, 0, 0);
    } else {
      startDate = new Date().getTime();
    }
    return [startDate, new Date(date.getTime()).setHours(23, 59, 59, 999)]; // new Date(date.getTime()) creates a copy
  }

  _updater(interval, callback) {
    this.updateTimer = setInterval(() => {
      this._fetchEventData(this._getCurrentPageDate())
        .then(data => callback(data))
        .catch(err => console.log(err.message));
    }, interval);
  }

  _startEventExpirator(eventData, callback) {
    if (eventData.length === 0) {
      return;
    }
    const interval = eventData[0]._source.startDate - new Date();
    this.expiratorTimer = setTimeout(() => {
      // create expiratorTimer for unregistering use
      callback(eventData.slice(1));
      this._startEventExpirator(eventData.slice(1), callback);
    }, interval);
  }

  _renderDateLabel(index, styles = {}) {
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
    const tmrStart = new Date(
      new Date(new Date().getTime() + MS_PER_DAY).setHours(0, 0, 0, 0)
    ); // clean this up
    const tmrEnd = new Date(
      new Date(new Date().getTime() + MS_PER_DAY).setHours(23, 59, 59, 999)
    );
    const currentRouteDate = new Date(
      new Date().getTime() + MS_PER_DAY * index
    );
    let dateLable = '';

    if (currentRouteDate <= todayEnd) {
      dateLable += 'Today | ';
    } else if (tmrStart <= currentRouteDate && currentRouteDate <= tmrEnd) {
      dateLable += 'Tomorrow | ';
    }

    dateLable += getDateStringByFormat(currentRouteDate, 'MMM. Do');
    return (
      <Text
        style={[
          { backgroundColor: 'transparent', margin: 8, fontSize: 17 },
          styles,
        ]}
      >
        {dateLable}
      </Text>
    );
  }

  _onRefresh() {
    this.setState({ refreshing: true, page: 0 });
    this._fetchAndScheduleExpiration(0, () => {
      this.setState({ refreshing: false });
    });
  }

  render() {
    const screenWidth = Dimensions.get('window').width;
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#eee' }}>
          {this._renderDateLabel(this.props.index, { marginLeft: 10 })}
          {/*
          {this._renderDateLabel(this.props.index, { marginLeft: 30 })}
          {this._renderDateLabel(this.props.index + 1, {
            position: 'absolute',
            left: screenWidth - 70,
            color: 'grey',
          })}
          */}
        </View>
        {this.state.eventData && this.state.eventData.getRowCount() ? (
          <ListView
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            onEndReachedThreshold={10}
            automaticallyAdjustContentInsets={false}
            contentInset={{ bottom: 100 }}
            ref="eventCalSearchResults"
            dataSource={this.state.eventData}
            renderRow={rowData => (
              <ActivitySearchResultEntry
                data={rowData}
                screenProps={this.props.screenProps}
              />
            )}
            onEndReached={() => {
              this.setState({ page: this.state.page + 1 }, () => {
                this._fetchAndScheduleExpiration(this.state.page);
              });
            }}
          />
        ) : this.state.loading ? null /*(
          <ActivityIndicator
            style={{ marginTop: 50 }}
            animating={this.state.loading}
            size="large"
          />
        )*/ : (
          <Text
            style={{
              textAlign: 'center',
              //marginTop: 40,
              fontSize: 18,
              color: '#ccc',
            }}
          >
            Post an activity
          </Text>
        )}
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    searchLocation: state.app.searchLocation,
    calendarState: state.eventCalendar,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    navigation: bindActionCreators({ push }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  ActivityCalendarPage
);
