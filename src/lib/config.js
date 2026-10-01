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

export const MASTER_PIN = import.meta.env?.VITE_MASTER_PIN || '';

// Helyszínek a térképen (gyorsgombok). `area`: a helyszín biztosan belső sarokpontjai
export const MAP_ZONES = [
  {
    id: 'fo_ter',
    name: 'Fő tér',
    center: [47.38823293772163, 16.54198903974581],
    zoom: 19,
    area: [
      [47.388745192866374, 16.542929533991177],
      [47.38849157924964, 16.542890215915047],
      [47.387857423029104, 16.541783506684276],
      [47.38814569769908, 16.54147646035853]
    ]
  },
  { id: 'jurisics', name: 'Jurisics tér', center: [47.38888797027688, 16.540977027699643], zoom: 19 },
  { id: 'vararok', name: 'Várárok', center: [47.38844703426874, 16.53874441895081], zoom: 19 }
];

