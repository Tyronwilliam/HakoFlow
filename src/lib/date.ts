import { format, formatDistanceToNow, isToday } from "date-fns";

export const formatDate = (date: string | null) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (isToday(parsedDate)) {
    return format(parsedDate, "HH:mm");
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true });
};
