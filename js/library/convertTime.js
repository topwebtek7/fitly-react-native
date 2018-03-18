import Moment from 'moment';

export const getWeekdayMonthDay = (date) => {
  return Moment(date).format("ddd, MMM D");
};

export const getHrMinDuration = (dateStart, dateEnd) => {
  return Moment(dateStart).format("h:mm A") + ' to ' + Moment(dateEnd).format("h:mm A");
};

export const getDateStringByFormat = (date, format) => {
  return Moment(date).format(format);
};

export const addOneHour = (dateString) => {
  const formatTo = 'ddd, MMM Do, h:mm A';
  const m = Moment(dateString, formatTo).add(1, 'hour');
  return {
    dateString: m.format(formatTo),
    date: m.toDate()
  };
};
