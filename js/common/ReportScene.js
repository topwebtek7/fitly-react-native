import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native'
import HeaderInView from '../header/HeaderInView'
import { pop } from '../actions/navigation.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Btn from '../common/Btn'
import Spinner from 'react-native-loading-spinner-overlay';



class ReportScene extends Component{
  constructor(props){
    super(props);
    this.state={
      reason: '',
      sending: false,
    }

  }

  _renderHeader = () => {
    return (
      <HeaderInView
        leftElement={{icon: "ios-close"}}
        title="Report"
        _onPressLeft={() => this.props.navigation.goBack()}
        />
    )
  }

  _submit = () => {
    this.setState({sending: true})
    const reportObj = {
      type: this.props.navigation.state.params.type,
      contentID: this.props.navigation.state.params.contentID,
      reporterID: this.props.uID,
      reason: this.state.reason,
    }

    this.props.FitlyFirebase.database().ref('reports').push(reportObj).then((x)=>{
      this.setState({sending: false}, () => setTimeout(this._alertSuccess, 10))
      this.props.navigation.goBack()
    }).catch((err) => {
      console.log(err);
      this.setState({sending: false}, () => setTimeout(this._alertFailure, 10))
      this.props.navigation.goBack()
    })
  }

  _alertSuccess = () => {
    Alert.alert(
      'You have successfully created a report',
      'Someone will investigate the issue and resolve the matter within 24 hours.\nThank You',
      [
        {
          text: "Done",
          onPress: () => {
            this.props.navigation.goBack()
          },
          style: 'cancel'
        },
      ],
    )
  }

  _alertFailure = () => {
    Alert.alert(
      'Error',
      "Something went wrong and your report couldn't be saved.\nPlease try again later.",
      [

        {text: 'Cancel', onPress: () => this.props.navigation.goBack(), style: 'cancel'},
        {text: 'Try Again', onPress: () => this._submit()},
      ],
      { cancelable: false }
    )
  }

  render(){
    return (
      <View style={{flex: 1, flexDirection: 'column', backgroundColor: '#fff', alignItems: 'center'}}>
        {this._renderHeader()}
        {this.state.sending ? <Spinner visible={this.state.sending} textContent={"sending report..."} textStyle={{color: '#FFF'}}/>:null}
        <Text style={{marginTop: 20}}>
          You want to report the {this.props.navigation.state.params.type} "{this.props.navigation.state.params.details.title || this.props.navigation.state.params.details.first_name+' '+this.props.navigation.state.params.details.last_name}".
        </Text>

        <TextInput
          underlineColorAndroid={'transparent'}
          style={{marginTop: 20, padding: 10, width: 300, height: 150, borderColor: '#aaa', borderWidth: 1, alignSelf: 'center', fontSize: 16}}
          multiline={true}
          placeholder={'write reason here for the report...'}
          onChangeText={(text)=>this.setState({reason: text})}
          value={this.state.reason}/>
        <Btn
          onPress={this._submit.bind(this)}
          style={{alignSelf: 'center'}}
          text={'Report'}/>
      </View>
    )
  }
}

const mapStateToProps = function(state) {
  return {
    uID: state.auth.uID,
    user: state.user.user,
    FitlyFirebase: state.app.FitlyFirebase,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    exnavigation: bindActionCreators({ pop }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportScene);
