/**
 * @file dateHelper.js
 * @description Shared date range utility for reports filtering.
 */

/**
 * Parses report query filters and returns start and end dates.
 * 
 * @param {string} range - Preset range ('today', 'thisWeek', 'thisMonth', 'thisYear', or 'custom').
 * @param {string} [startDateStr] - Custom start date string.
 * @param {string} [endDateStr] - Custom end date string.
 * @returns {Object} An object containing { startDate, endDate }.
 */
const getStartEndDates = (range, startDateStr, endDateStr) => {
  const start = new Date();
  const end = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisWeek':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisMonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisYear':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      if (startDateStr && endDateStr) {
        const customStart = new Date(startDateStr);
        const customEnd = new Date(endDateStr);
        if (!isNaN(customStart.getTime()) && !isNaN(customEnd.getTime())) {
          return { startDate: customStart, endDate: customEnd };
        }
      }
      // Default to last 30 days if no valid range matches
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate: start, endDate: end };
};

module.exports = {
  getStartEndDates
};
