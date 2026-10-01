import { getStage } from './stages';
import { FESTIVAL } from './config';
import { findArtist } from './artists';
import { sortByTime } from './time';

// Tömör fellépői tájékoztató (WhatsApp / Viber / SMS)
export function buildArtistInfo(artist, schedule, users) {
  const slots = sortByTime(schedule.filter(s => findArtist([artist], s)));
  const lines = [`${FESTIVAL.shortName} ${FESTIVAL.year} – ${artist.name}`];

  if (slots.length === 0) lines.push('Időpont: még egyeztetés alatt');
  slots
    .sort((a, b) => FESTIVAL.days.findIndex(d => d.name === a.day) - FESTIVAL.days.findIndex(d => d.name === b.day))
    .forEach(s => {
      const stage = getStage(s.stageId);
      const date = FESTIVAL.days.find(d => d.name === s.day)?.date;
      const manager = users.find(u => u.name === s.stageManager);
      const parts = [
        `${s.day}${date ? ` (${date.slice(5).replace('-', '.')}.)` : ''}`,
        `Színpad: ${stage ? `${stage.name}` : s.stageId}`,
        s.loadIn && `Érkezés: ${s.loadIn}`,
        s.soundcheck && `Beállás: ${s.soundcheck}`,
        `Koncert: ${s.time}`,
        s.stageManager && `Színpadmester: ${s.stageManager}${manager?.phone ? ` (${manager.phone})` : ''}`
      ].filter(Boolean);
      lines.push(parts.join(' | '));
    });

  const extra = [
    artist.parkingInfo && `Parkolás: ${artist.parkingInfo}${artist.passes ? ` (${artist.passes} behajtó)` : ''}`,
    !artist.parkingInfo && artist.passes ? `Behajtó kártya: ${artist.passes} db` : null,
    artist.hospitality && `Ellátás: ${artist.hospitality}`
  ].filter(Boolean);
  if (extra.length) lines.push(extra.join(' | '));

  return lines.join('\n');
}
