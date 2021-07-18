import moment from 'moment'

export const isDateTodayOrBefore = (date: Date) => {
  return (
    moment(date).isSame(moment(new Date()), 'day') || isDateBeforeToday(date)
  )
}

export const isDateBeforeToday = (date: Date) => {
  return new Date(date.toDateString()) < new Date(new Date().toDateString())
}

export const getTimeStamp = (date: Date) => {
  return `0${date.getHours()}`.slice(-2) + `0${date.getMinutes()}`.slice(-2)
}

export const getDateByDayDifference = (date: Date, difference: number) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + difference
  )
}
