export type DailyHours = {
  start: string; // HH:MM
  end: string;   // HH:MM
};

export type StoreHours = {
  monSat: DailyHours;
  sun: DailyHours;
};

export const STORE_TIME_ZONE = 'Europe/Astrakhan';

// Графики работы для разных точек
// Рыбинская 25Н — основная точка
export const RYBINSKAYA_HOURS: StoreHours = {
  monSat: { start: '08:00', end: '16:00' },
  sun: { start: '08:00', end: '14:00' },
};

// пл. Свободы 14К
export const SVOBODY_HOURS: StoreHours = {
  monSat: { start: '09:00', end: '19:00' },
  sun: { start: '10:00', end: '18:00' },
};

// Основной график (Рыбинская) — используется по умолчанию
export const DEFAULT_STORE_HOURS: StoreHours = RYBINSKAYA_HOURS;

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function parseTimeToMinutes(value: string): number {
  const [h, m] = value.split(':').map((v) => Number(v));
  const hours = Number.isFinite(h) ? h : 0;
  const minutes = Number.isFinite(m) ? m : 0;
  return hours * 60 + minutes;
}

function getZonedParts(date: Date, timeZone: string): { day: number; minutes: number } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const weekday = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
  const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';
  const minuteStr = parts.find((p) => p.type === 'minute')?.value || '0';
  const day = WEEKDAY_MAP[weekday] ?? 1;
  const hour = Number.parseInt(hourStr, 10) || 0;
  const minute = Number.parseInt(minuteStr, 10) || 0;
  return { day, minutes: hour * 60 + minute };
}

export function formatStoreHoursInline(hours: StoreHours = DEFAULT_STORE_HOURS): string {
  return `Пн-Сб ${hours.monSat.start}-${hours.monSat.end}, Вск ${hours.sun.start}-${hours.sun.end}`;
}

export function formatStoreHoursLines(hours: StoreHours = DEFAULT_STORE_HOURS): { monSat: string; sun: string } {
  return {
    monSat: `Пн-Сб: ${hours.monSat.start}-${hours.monSat.end}`,
    sun: `Вск: ${hours.sun.start}-${hours.sun.end}`,
  };
}

// Проверка открыта ли конкретная точка
export function isStoreOpenAt(
  hours: StoreHours,
  date: Date = new Date(),
  timeZone: string = STORE_TIME_ZONE,
): boolean {
  return isStoreOpenNow(hours, date, timeZone);
}

export function isStoreOpenNow(
  hours: StoreHours = DEFAULT_STORE_HOURS,
  date: Date = new Date(),
  timeZone: string = STORE_TIME_ZONE,
): boolean {
  const { day, minutes } = getZonedParts(date, timeZone);
  const dayHours = day === 0 ? hours.sun : hours.monSat;
  const start = parseTimeToMinutes(dayHours.start);
  const end = parseTimeToMinutes(dayHours.end);
  return minutes >= start && minutes < end;
}
