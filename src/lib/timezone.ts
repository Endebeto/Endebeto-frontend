export const EXPERIENCE_TIME_ZONE = "Africa/Addis_Ababa";

function getDateTimeParts(date: Date, timeZone = EXPERIENCE_TIME_ZONE) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  ) as Record<string, string>;
}

export function localDateTimeToUtcIso(value: string, timeZone = EXPERIENCE_TIME_ZONE) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) throw new Error("Choose a valid date and time.");

  const [, year, month, day, hour, minute, second = "00"] = match;
  const wallTime = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  const actual = getDateTimeParts(new Date(wallTime), timeZone);
  const zoneWallTime = Date.UTC(
    +actual.year,
    +actual.month - 1,
    +actual.day,
    +actual.hour,
    +actual.minute,
    +actual.second,
  );
  return new Date(wallTime - (zoneWallTime - wallTime)).toISOString();
}

export function utcIsoToLocalDateTime(value?: string, timeZone = EXPERIENCE_TIME_ZONE) {
  if (!value) return "";
  const parts = getDateTimeParts(new Date(value), timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatExperienceDateTime(
  value: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EXPERIENCE_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}
