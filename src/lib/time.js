import { FESTIVAL, PARALLEL_STAGES } from './config';

const DAY_START = FESTIVAL.dayStartsAtHour * 60;

// "18:30" -> 1110 (perc); a nap eleje (06:00) előtti időpontok az éjszakához tartoznak (+24h)
export function parseClock(str) {
  const m = /(\d{1,2})[:.](\d{2})/.exec(str || '');
  if (!m) return null;
  let minutes = Number(m[1]) * 60 + Number(m[2]);
  if (minutes < DAY_START) minutes += 1440;
  return minutes;
}

// "23:30 - 02:00" -> { start: 1410, end: 1560 }
export function parseRange(str) {
  const [a, b] = (str || '').split(/\s*[-–—]\s*/);
  const start = parseClock(a);
  if (start == null) return null;
  let end = parseClock(b);
  if (end == null) end = start + 60;
  while (end <= start) end += 1440;
  return { start, end };
}

export function formatClock(minutes) {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} perc`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ó ${m} p` : `${h} óra`;
}

export function sortByTime(items, field = 'time') {
  return [...items].sort((a, b) => {
    const ra = parseRange(a[field]);
    const rb = parseRange(b[field]);
    return (ra ? ra.start : Infinity) - (rb ? rb.start : Infinity);
  });
}

// Ütköző műsorok ugyanazon a napon, ugyanazon a színpadon: [{ a, b, stageId }]
export function findOverlaps(schedule) {
  const conflicts = [];
  const groups = {};
  schedule.forEach(item => {
    if (PARALLEL_STAGES.includes(item.stageId)) return;
    const key = `${item.day}|${item.stageId}`;
    (groups[key] = groups[key] || []).push(item);
  });
  Object.values(groups).forEach(items => {
    const sorted = sortByTime(items);
    for (let i = 0; i < sorted.length; i++) {
      const ri = parseRange(sorted[i].time);
      if (!ri) continue;
      for (let j = i + 1; j < sorted.length; j++) {
        const rj = parseRange(sorted[j].time);
        if (!rj) continue;
        if (rj.start >= ri.end) break;
        conflicts.push({ a: sorted[i], b: sorted[j], stageId: sorted[i].stageId });
      }
    }
  });
  return conflicts;
}

function localDateString(date) {
  return date.toLocaleDateString('sv-SE'); // YYYY-MM-DD helyi idő szerint
}

// Hol tartunk a fesztiválhoz képest? { status: 'before'|'during'|'after', day, minutes, daysUntil }
export function getFestivalClock(now = new Date()) {
  const shifted = new Date(now.getTime() - DAY_START * 60000);
  const today = localDateString(shifted);
  const day = FESTIVAL.days.find(d => d.date === today);
  let minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < DAY_START) minutes += 1440;

  if (day) return { status: 'during', day: day.name, minutes, daysUntil: 0 };

  const first = FESTIVAL.days[0].date;
  if (today < first) {
    const daysUntil = Math.ceil((new Date(first) - new Date(today)) / 86400000);
    return { status: 'before', day: null, minutes, daysUntil };
  }
  return { status: 'after', day: null, minutes, daysUntil: 0 };
}
