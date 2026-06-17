import { format, isThisYear, isToday } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDate = (date: string | null) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (isToday(parsedDate)) {
    return format(parsedDate, "HH:mm");
  }

  if (isThisYear(parsedDate)) {
    return format(parsedDate, "d MMMM", { locale: fr });
  }

  return format(parsedDate, "dd/MM/yyyy");
};
