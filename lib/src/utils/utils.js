import { shiftDate, getBeginningTimeForDate, convertToDate } from "./helpers";
import {
  SQUARE_SIZE,
  MONTH_LABELS,
  DAYS_IN_WEEK,
  MONTH_LABEL_GUTTER_SIZE,
  MILLISECONDS_IN_ONE_DAY
} from "./constants";

function getTransformForMonthLabels(horizontal, gutterSize) {
  if (horizontal) {
    return null;
  }
  return `${getWeekWidth(gutterSize) + MONTH_LABEL_GUTTER_SIZE}, 0`;
}

function getTransformForAllWeeks(showMonthLabels, horizontal) {
  if (horizontal)
    return `0, ${getMonthLabelSize(showMonthLabels, horizontal) - 100}`;
  return null;
}

function getWeekWidth(gutterSize) {
  return DAYS_IN_WEEK * getSquareSizeWithGutter(gutterSize);
}

function getWidth(numDays, endDate, gutterSize) {
  return (
    getWeekCount(numDays, endDate) * getSquareSizeWithGutter(gutterSize) -
    gutterSize
  );
}

function getHeight(gutterSize, showMonthLabels, horizontal) {
  return (
    getWeekWidth(gutterSize) +
    (getMonthLabelSize(showMonthLabels, horizontal) - gutterSize)
  );
}

function getViewBox(numDays, endDate, gutterSize, showMonthLabels, horizontal) {
  if (horizontal) {
    return `${getWidth(numDays, endDate, gutterSize)} ${getHeight(
      gutterSize,
      showMonthLabels,
      horizontal
    )}`;
  }
  return `${getHeight(gutterSize, showMonthLabels, horizontal)} ${getWidth(
    numDays,
    endDate,
    gutterSize
  )}`;
}

function getValueForIndex(index, valueCache) {
  if (valueCache[index]) return valueCache[index].value;
  return null;
}

function getTooltipDataAttrsForValue(value, tooltipDataAttrs) {
  if (typeof tooltipDataAttrs === "function") return tooltipDataAttrs(value);
  return tooltipDataAttrs;
}

function getTooltipDataAttrsForIndex(index, valueCache, tooltipDataAttrs) {
  if (valueCache[index]) {
    return valueCache[index].tooltipDataAttrs;
  }
  return getTooltipDataAttrsForValue(
    { date: null, count: null },
    tooltipDataAttrs
  );
}

function getCountByDuplicateValues(array) {
  let hashMap = {};

  for (var item of array) {
    //if that date exists
    if (item.date in hashMap) {
      //up the prev count
      hashMap[item.date] = hashMap[item.date] + 1;
    } else {
      hashMap[item.date] = 1;
    }
  }

  //now we will iterate through those keys of the Map and format it for Array 2
  let outputArray = [];
  Object.keys(hashMap).forEach(key => {
    outputArray.push({
      key,
      count: hashMap[key]
    });
  });
  return outputArray;
}

function findColorLevel(count, rectColor, maxCount) {
  const levelCount = rectColor.length - 1; // Number of color levels
  const step = Math.ceil(maxCount / levelCount); // Calculate step size

  // Find the appropriate color level based on the count
  for (let i = 1; i <= levelCount; i++) {
    if (count <= step * i) {
      return rectColor[i];
    }
  }

  return rectColor[levelCount]; // Return the last color level
}

function getFillColor(index, valueCache, rectColor) {

  const indices = Object.keys(valueCache);

  // Check if the provided index exists in the indices array
  if (indices.includes(index.toString())) {
    // Retrieve the count from the corresponding entry in valueCache
    const count = valueCache[index].countedArray.count;
    
    // Calculate the maximum count from all counts in valueCache
    const maxCount = Math.max(...indices.map(i => valueCache[i].countedArray.count));
    
    // Determine fill color based on count and maxCount
    const fillColor = findColorLevel(count, rectColor, maxCount);
    
    return fillColor;
  }

  return rectColor[0];
}

function getTitleForIndex(index, valueCache, titleForValue) {
  if (valueCache[index]) return valueCache[index].title;
  return titleForValue ? titleForValue(null) : null;
}

function getSquareCoordinates(dayIndex, horizontal, gutterSize) {
  if (horizontal) return [0, dayIndex * getSquareSizeWithGutter(gutterSize)];
  return [dayIndex * getSquareSizeWithGutter(gutterSize), 0];
}

function getTransformForWeek(weekIndex, horizontal, gutterSize, showMonthLabels) {
  if (horizontal) {
    return [weekIndex * getSquareSizeWithGutter(gutterSize), getMonthLabelSize(showMonthLabels, horizontal)];
  }
  if (horizontal && !showMonthLabels) {
    return [weekIndex * getSquareSizeWithGutter(gutterSize), 0];
  }
  return [10, weekIndex * getSquareSizeWithGutter(gutterSize)];
}

function getMonthLabelSize(showMonthLabels, horizontal) {
  if (!showMonthLabels) {
    return 0;
  } else if (horizontal) {
    return SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE;
  }
  return 2 * (SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE);
}

function getSquareSizeWithGutter(gutterSize) {
  return SQUARE_SIZE + gutterSize;
}

function getMonthLabelCoordinates(
  weekIndex,
  horizontal,
  gutterSize,
) {
  if (horizontal) {
    return [
      weekIndex * getSquareSizeWithGutter(gutterSize),
      0
    ];
  }
  const verticalOffset = -2;
  return [
    0,
    (weekIndex + 1) * getSquareSizeWithGutter(gutterSize) + verticalOffset
  ];
}

function getStartDateWithEmptyDays(numDays, endDate) {
  return shiftDate(
    getStartDate(numDays, endDate),
    -getNumEmptyDaysAtStart(numDays, endDate)
  );
}

function getEndDate(endDate) {
  return getBeginningTimeForDate(convertToDate(endDate));
}

function getStartDate(numDays, endDate) {
  return shiftDate(getEndDate(endDate), -numDays + 1); // +1 because endDate is inclusive
}

function getNumEmptyDaysAtEnd(endDate) {
  return DAYS_IN_WEEK - 1 - getEndDate(endDate).getDay();
}

function getNumEmptyDaysAtStart(numDays, endDate) {
  return getStartDate(numDays, endDate).getDay();
}

function getWeekCount(numDays, endDate) {
  const numDaysRoundedToWeek =
    numDays +
    getNumEmptyDaysAtStart(numDays, endDate) +
    getNumEmptyDaysAtEnd(endDate);
  return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);
}

export {
  getWeekCount,
  getStartDateWithEmptyDays,
  getMonthLabelCoordinates,
  getTransformForWeek,
  getNumEmptyDaysAtStart,
  getSquareCoordinates,
  getTitleForIndex,
  getFillColor,
  getCountByDuplicateValues,
  getTooltipDataAttrsForIndex,
  getTooltipDataAttrsForValue,
  getHeight,
  getWidth
};

export default {
  getWeekCount,
  getStartDateWithEmptyDays,
  getMonthLabelCoordinates,
  getTransformForWeek,
  getNumEmptyDaysAtStart,
  getSquareCoordinates,
  getTitleForIndex,
  getFillColor,
  getCountByDuplicateValues,
  getTooltipDataAttrsForIndex,
  getTooltipDataAttrsForValue,
  getHeight,
  getWidth
};
