import React, { Component } from 'react';
import { composeStyle, headerStyle } from '../../styles/styles.js';
import { View, Text, ScrollView, Image, TouchableHighlight, TouchableOpacity, ActivityIndicator } from 'react-native';
import { push, pop, resetTo } from '../../actions/navigation.js';
import { save, clear } from '../../actions/drafts.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import HeaderInView from '../../header/HeaderInView.js'
import Icon from 'react-native-vector-icons/Ionicons';
import {randomString} from '../../library/firebaseHelpers.js'

class MakePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    }
  };

  componentDidMount() {
    if (!this.props.navigation.state.params.draftRef) {
      const draftRef = randomString();
      this.setState({
        draftRef: draftRef
      })
      this.props.draftsAction.save(draftRef,{
        category: '',
        title: '',
        content: '',
        tags: [],
        photos: [],
        photoRefs: null,
      })
    } else {
      this.setState({
        draftRef: this.props.navigation.state.params.draftRef
      })
    }
  };

  componentWillUnmount() {
    // this.props.draftsAction.clear(this.state.draftRef);
  };

  _renderCategories(categories) {
    return categories.map((category, index) => {
      let containerStyle = composeStyle.category;
      let textStyle = composeStyle.categoryText;
      if (this.props.drafts[this.state.draftRef].category === category) {
        containerStyle = [composeStyle.category, {backgroundColor: '#1D2F7B'}];
        textStyle = [composeStyle.categoryText, {color: 'white'}];
      }

      return (
        <TouchableHighlight
          style={containerStyle}
          key={index}
          onPressIn={()=>{this.props.draftsAction.save(this.state.draftRef, {category: category})}}
          onPressOut={() => {this._onPress()}}>
          <Text style={textStyle}>{category}</Text>
        </TouchableHighlight>
      );
    });
  };

  _onPress() {
    this.props.navigation.goBack();
  };

  _onPressLeft() {
    this.props.navigation.goBack();
    this.props.draftsAction.clear(this.state.draftRef);
  }

  _renderHeader() {
    return (
      <HeaderInView
        leftElement={{icon: "ios-close"}}
        title="Choose a Post Category"
        _onPressLeft={() => this._onPressLeft()}
      />
    );
  };

  render() {
    if (!this.props.drafts[this.state.draftRef]) {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <ActivityIndicator
            animating={true}
            style={{height: 80}}
            size="large"
          />
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          {this._renderHeader()}
          <View style={composeStyle.container}>
            {this._renderCategories(['Workout Plan', 'Meal Plan', 'Photos', 'Others'])}
          </View>
        </View>
      );
    }
  }
};

const mapStateToProps = function(state) {
  return {
    drafts: state.drafts.drafts,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ push, pop, resetTo }, dispatch),
    draftsAction: bindActionCreators({ save, clear }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MakePost);
