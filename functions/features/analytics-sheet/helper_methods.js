
function getFixedCalendarWeeks(startDate, endDate, isMillisFormatRequired, isReverseFormatRequired) {
  let result = [];

  let weekStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  let currentDate = new Date(weekStartDate);

  while (currentDate <= endDate) {
    let endOfWeek = new Date(currentDate);
    endOfWeek.setDate(currentDate.getDate() + 6);
    if (endOfWeek > endDate) {
      endOfWeek = endDate;
    }
    let weekEndDate = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate(), 23, 59, 59, 999);

    if(isMillisFormatRequired){
      result.push({
        weekStart: Math.ceil(currentDate.getTime() / 1000),
        weekEnd: Math.ceil(weekEndDate.getTime() / 1000),
      });
    }
    else{
      result.push({
        weekStart: currentDate.toISOString().split('T')[0],
        weekEnd: weekEndDate.toISOString().split('T')[0],
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 7);
  }

  if(isReverseFormatRequired){
    result = [...result].reverse();
  }
  return result;
}

/**
 * Generates a week start and end date given week.
 * @param {Array} week - week
 * @returns {string} - week start and end date in string format 
 */
const getWeeklyDateAsKeys = (week) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if(week){

      let weekStart = new Date(week.weekStart * 1000);
      let weekEnd = new Date(week.weekEnd * 1000);

      // set -1 minute to weekEnd
      weekEnd.setMinutes(weekEnd.getMinutes() - 1);
      
      const startMonth = months[weekStart.getMonth()];
      const startDay = weekStart.getDate();
      const endMonth = months[weekEnd.getMonth()];
      const endDay = weekEnd.getDate();
      const range = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;

      return range;
    }

  } catch (error) {
    console.log(error)
  }
}


/**
 * Generates a list of dates for the last 7 days from today. (initialCCDate)
 * @param {date} initialDateTime - initialDateTime
 * @returns {Array<string>} - weekDates 
 */
function getWeeklyFixedDatesAsKeys(startDate, endDate, isReverseFormatRequired) {
  let result = [];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


  let weekStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  let currentDate = new Date(weekStartDate);

  while (currentDate <= endDate) {
    let endOfWeek = new Date(currentDate);
    endOfWeek.setDate(currentDate.getDate() + 6);
    if (endOfWeek > endDate) {
      endOfWeek = endDate;
    }
    let weekEndDate = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate(), 23, 59, 59, 999);

      const startMonth = months[currentDate.getMonth()];
          const startDay = currentDate.getDate();
          const endMonth = months[weekEndDate.getMonth()];
          const endDay = weekEndDate.getDate();
          const range = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
          result.push(range);
    
    
    currentDate.setDate(currentDate.getDate() + 7);
  }

  if(isReverseFormatRequired){
    result = [...result].reverse();
  }
  return result;
}

function getDayStartAndEndMillis(startDate, endDate) {

  // Get the start and end of the day in milliseconds
const startOfDayMillis = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
const endOfDayMillis = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime();
  return {
    'weekStart': Math.ceil(startOfDayMillis / 1000),
    'weekEnd': Math.ceil(endOfDayMillis / 1000)
  };
}

function getTodayDateInMillisFormat() {
  let today = new Date();
  // // TODO: UnComment THIS LINE BEFORE RELEASE minus the days to set date to 3 februay2024 while today is 12 february 2024
  // today.setDate(today.getDate() - 2);

  const todayDayStart = Math.ceil(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000);
  return todayDayStart;
}


function getNextDateInMillisFormat(dateTime) {
  
  let date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());

  date.setDate(date.getDate() + 1);

  return Math.ceil(date.getTime() / 1000);
}


/**
 * get all available weeks from given date till now.
 * @returns {Promise<array>} - weekDates
 */
const getAllAvailableWeeks = async (initialDate) => {
  try {
    
    let initialDatePoint = initialDate;

    // Calculate the current date
    const today = new Date();
    // Calculate week starting and ending dates
    const weekDates = [];
    let currentWeekStartDate = new Date(today);
    let currentWeekEndDate = new Date(currentWeekStartDate);

    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 6);

    while (currentWeekStartDate >= initialDatePoint || currentWeekEndDate >= initialDatePoint) {
      weekDates.push({
        weekStart: currentWeekStartDate.toISOString().split('T')[0],
        weekEnd: currentWeekEndDate.toISOString().split('T')[0],
      });

      // Move to the previous week
      currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekEndDate.getDate() - 1);
      currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
    }
    return weekDates;

  } catch (error) {
    console.log(error)
  }
}


module.exports = {
  getFixedCalendarWeeks,
  getDayStartAndEndMillis,
  getTodayDateInMillisFormat,
  getNextDateInMillisFormat,
  getWeeklyFixedDatesAsKeys,
  getAllAvailableWeeks,
  getWeeklyDateAsKeys
}
