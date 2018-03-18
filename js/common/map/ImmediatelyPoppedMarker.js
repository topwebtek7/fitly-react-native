import React, { Component } from 'react';
import MapView from 'react-native-maps';
import {Platform} from 'react-native';

const isAndroid = Platform.OS === 'android';

export default class ImmediatelyPoppedMarker extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this._showMarker();
  }

  _showMarker = (delay = 500) => {
    setTimeout(() => {
      //the popup needs sometime to load before it can pop, but this is not a very pretty solution
      //see: https://github.com/airbnb/react-native-maps/issues/141
      this.refs.marker.showCallout()
    }, delay)
  }

  componentWillReceiveProps(nextProps) {
    const { placeName: currentName } = this.props;
    const { placeName: nextPlaceName } = nextProps;
    if(isAndroid) {
      this._showMarker(0)
    } else {
      if(currentName != nextPlaceName) {
        this._showMarker()
      }
    }
  }

  render() {
    const {coordinate, title = null, description = null} = this.props;
    return (
      <MapView.Marker ref='marker'
        coordinate={coordinate}
        title={title}
        description={description}
      >
        {this.props.children}
      </MapView.Marker>
    )
  }
};
