/**
 * Open-Meteo returns hourly timestamps as local wall-clock values without an
 * offset. Keep comparisons in that same representation rather than letting
 * the browser interpret them in its own timezone.
 */
export function getTimeKey(value: string): string {
  return value.replace("T", " ").slice(0, 16);
}

export function getCurrentTimeKey(timezone?: string, date = new Date()): string {
  if (!timezone || timezone === "auto") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  try {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).format(date).replace("T", " ");
  } catch {
    return getCurrentTimeKey("auto", date);
  }
}

export function getTimeKeyAfterHours(
  hours: number,
  timezone?: string,
  date = new Date()
): string {
  return getCurrentTimeKey(timezone, new Date(date.getTime() + hours * 60 * 60 * 1000));
}
