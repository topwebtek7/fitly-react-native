import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import ScrollPicker from 'react-native-picker-scrollview';

const hours = Array(12).fill().map((_, i) => i+1); // 1-12
const minutes = Array(60).fill().map((_, i) => i); // 0-59
const formatFrom = 'YYYY-MM-DD h m A';
const formatTo = 'ddd, MMM Do, h:mm A';

class DatePicker extends Component {
  state = {}

  componentDidMount() {
    this.setState({ selected: this.props.dateString });
  }

  onDayPress = day => {
    this.setState({ selected: day.dateString });
    this.props.onDayPress(day.dateString);
  }

  renderArrow = direction => (
    <Icon
      name={direction === 'right' ? 'ios-arrow-forward' : 'ios-arrow-back'}
      size={30}
      color='darkcyan'
    />
  )

  render() {
    const { minDate, maxDate, dateString } = this.props;

    return (
      <Calendar
        current={this.state.selected}
        minDate={minDate}
        maxDate={maxDate}
        markedDates={{[this.state.selected]: {selected: true}}}
        onDayPress={this.onDayPress}
        renderArrow={this.renderArrow}
        hideExtraDays
        theme={{
          textSectionTitleColor: 'gray',
          selectedDayBackgroundColor: 'darkcyan',
          selectedDayTextColor: 'white',
          todayTextColor: 'darkcyan',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          monthTextColor: 'black',
        }}
      />
    );
  }
}

class ScrollPick extends Component {
  renderItem = (value, index, isSelected) => (
    <View style={{backgroundColor: 'white'}}>
      <Text style={isSelected ? styles.textItemSelected : styles.textItem}>{value}</Text>
    </View>
  )

  render() {
    const { data, index } = this.props;
    return (
      <ScrollPicker
        ref={(sp) => {this.sp = sp}}
        dataSource={data}
        selectedIndex={index}
        itemHeight={40}
        wrapperHeight={200}
        highlightColor={'transparent'}
        renderItem={this.renderItem}
        onValueChange={this.props.onChange}
      />
    );
  }
}

class TimePicker extends Component {
  render() {
    const { hour, minute, ampm, onHourChange, onMinuteChange, onAMPMChange } = this.props;

    return (
      <View style={styles.timeView}>
        <View style={styles.rowTime1}>
          <ScrollPick data={hours} index={hour-1} onChange={onHourChange}/>
        </View>
        <View style={styles.rowTime1}>
          <ScrollPick data={[':']} index={0}/>
        </View>
        <View style={styles.rowTime1}>
          <ScrollPick data={minutes} index={minute} onChange={onMinuteChange}/>
        </View>
        <View style={styles.rowTime2}>
          <ScrollPick data={['AM','PM']} index={ampm === 'AM' ? 0 : 1} onChange={onAMPMChange}/>
        </View>
      </View>
    );
  }
}

class Buttons extends Component {
  render() {
    return (
      <View style={styles.btnView}>
        <View style={styles.rowBtn1}/>
        <TouchableOpacity style={styles.rowBtn2} onPress={this.props.onCancel}>
          <Text style={styles.textBtn}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rowBtn2} onPress={this.props.onDone}>
          <Text style={styles.textBtn}>DONE</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default class DateTimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  setModalVisible = visible => this.setState({ visible });

  onPressDate = () => {
    this.setModalVisible(true);
    if (this.dateString) return;
    const now = moment(this.props.minDate || new Date()).format(formatFrom).split(' ');
    this.dateString = now[0];
    this.hour = +now[1];
    this.minute = +now[2];
    this.ampm = now[3];
  }

  onDayPress = dateString => this.dateString = dateString;
  onHourChange = hour => this.hour = hour;
  onMinuteChange = minute => this.minute = minute;
  onAMPMChange = ampm => this.ampm = ampm;
  onCancel = () => this.setModalVisible(false);
  onDone = () => {
    const newDate = this.dateString+' '+this.hour+' '+this.minute+' '+this.ampm;
    const m = moment(newDate, formatFrom);
    const dateString = m.format(formatTo);
    const date = m.toDate();
    this.props.onDateChange(dateString, date);
    this.setModalVisible(false);
  }

  render() {
    const { minDate, maxDate } = this.props;
    return (
      <Modal
        transparent
        visible={this.state.visible}
        onRequestClose={() => this.setModalVisible(false)}
      >
        <View style={styles.container}>
          <View style={styles.innerContainer}>
            <View style={styles.rowDate}>
              <DatePicker
                minDate={minDate || new Date()}
                maxDate={maxDate || moment(minDate || new Date()).add(1, 'year').toDate()}
                dateString={this.dateString}
                onDayPress={this.onDayPress}
              /> 
            </View>
            <View style={styles.rowTime}>
              <TimePicker
                hour={this.hour}
                minute={this.minute}
                ampm={this.ampm}
                onHourChange={this.onHourChange}
                onMinuteChange={this.onMinuteChange}
                onAMPMChange={this.onAMPMChange}
              /> 
            </View>
            <View style={styles.rowButtons}>
              <Buttons onCancel={this.onCancel} onDone={this.onDone}/>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'white', 
  },
  rowDate: {
    flex: .6,
  },
  rowTime: {
    flex: .3,
  },
  rowButtons: {
    flex: .1,
  },
  btnView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBtn1: {
    flex: .6,
  },
  rowBtn2: {
    flex: .2,
    alignItems: 'center',
  },
  timeView: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: .5,
    borderTopWidth: .5,
    borderColor: 'lightgray',
    marginHorizontal: 20,
  },
  rowTime1: {
    flex: .2,
  },
  rowTime2: {
    flex: .4,
  },
  textItem: {
    fontSize: 20,
    color: 'gray',
  },
  textItemSelected: {
    fontSize: 25,
    color: 'darkcyan',
  },
  textBtn: {
    color: 'darkcyan',
  },
});
