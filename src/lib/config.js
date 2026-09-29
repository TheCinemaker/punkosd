// Fesztivál alapadatok — új évnél csak ezt a fájlt kell átírni
export const FESTIVAL = {
  name: 'KTSZE Világ- és Utcazenei Fesztivál',
  shortName: 'KTSZE Fesztivál',
  place: 'Kőszeg',
  year: 2026,
  days: [
    { name: 'Péntek', date: '2026-05-22' },
    { name: 'Szombat', date: '2026-05-23' },
    { name: 'Vasárnap', date: '2026-05-24' },
    { name: 'Hétfő', date: '2026-05-25' }
  ],
  // 06:00 előtt még az előző fesztiválnaphoz tartozik minden (pl. péntek éjjel 02:00)
  dayStartsAtHour: 6
};

// Színpadok, ahol több produkció párhuzamosan is mehet (ütközésvizsgálat kihagyja)
export const PARALLEL_STAGES = ['street_points'];

export const MASTER_PIN = import.meta.env?.VITE_MASTER_PIN || '';
