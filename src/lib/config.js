// Fesztivál alapadatok — új évnél csak ezt a fájlt kell átírni
export const FESTIVAL = {
  name: 'KTSZE Világ- és Utcazenei Fesztivál',
  shortName: 'KTSZE Fesztivál',
  place: 'Kőszeg',
  year: 2027,
  days: [
    { name: 'Péntek', date: '2027-05-14' },
    { name: 'Szombat', date: '2027-05-15' },
    { name: 'Vasárnap', date: '2027-05-16' },
    { name: 'Hétfő', date: '2027-05-17' }
  ],
  // 06:00 előtt még az előző fesztiválnaphoz tartozik minden (pl. péntek éjjel 02:00)
  dayStartsAtHour: 6
};

// Színpadok, ahol több produkció párhuzamosan is mehet (ütközésvizsgálat kihagyja)
export const PARALLEL_STAGES = ['street_points'];

export const MASTER_PIN = import.meta.env?.VITE_MASTER_PIN || '';
