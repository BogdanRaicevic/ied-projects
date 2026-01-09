import type { DailyStat } from "@ied-shared/index";
import {
  eachDayOfInterval,
  format,
  isValid,
  isWeekend,
  parseISO,
} from "date-fns";
import { srLatn } from "date-fns/locale";

export const populateMissingDays = ({
  dailyStats,
  dateStart,
  dateEnd,
}: {
  dailyStats: DailyStat[];
  dateStart: string;
  dateEnd: string;
}) => {
  const startDate = parseISO(dateStart);
  const endDate = parseISO(dateEnd);

  if (!isValid(startDate) || !isValid(endDate)) {
    throw new Error("Invalid dateStart or dateEnd provided");
  }

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const statsMap = new Map(
    dailyStats.map((stat) => [format(stat.date, "yyyy-MM-dd"), stat]),
  );

  const allDates = allDays.map((d) => {
    const dayString = format(d, "yyyy-MM-dd");
    const existingStat = statsMap.get(dayString);

    if (existingStat) {
      return existingStat;
    }

    return {
      date: dayString,
      new: 0,
      deleted: 0,
      aggregatedUpdated: 0,
      earliestEdit: "N/A",
      latestEdit: "N/A",
      estimatedWorkTime: 0,
      averageTimeBetweenEntries: 0,
      biggestGapBetweenEntries: 0,
    };
  });

  return allDates;
};

// Helper to get Serbian day name and check for weekend
export const getDayInfo = (dateString: string) => {
  const date = parseISO(dateString);
  if (!isValid(date)) {
    throw new Error("Invalid date string provided");
  }
  const dayName = format(date, "EEEE", { locale: srLatn }); // Default locale is Serbian
  return {
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    isWeekend: isWeekend(date),
  };
};

export const getNumberOfBusinessDays = (dateStart: string, dateEnd: string) => {
  const startDate = parseISO(dateStart);
  const endDate = parseISO(dateEnd);

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  return allDays.filter((day) => !isWeekend(day)).length;
};

export const getTimeFromISODate = (isoDate: string) => {
  const date = parseISO(isoDate);
  if (!isValid(date)) {
    return "N/A";
  }
  return format(date, "HH:mm");
};

export const minutesToHoursAndMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let result = "";
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0) {
    result += `${minutes}m`;
  }
  return result.trim() || "0m";
};
