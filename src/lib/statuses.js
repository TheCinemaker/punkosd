// Egységes szerződésállapotok (fellépő, szolgáltató, árus)
export const CONTRACT_STATUSES = [
  { value: 'Nincs még', badge: 'badge-gray' },
  { value: 'Egyeztetés folyamatban', badge: 'badge-amber' },
  { value: 'Kiküldve, aláírásra vár', badge: 'badge-blue' },
  { value: 'Aláírva', badge: 'badge-green' },
  { value: 'Visszalépett / lemondta', badge: 'badge-rose' }
];

// Régebbi értékek megfeleltetése
const LEGACY = {
  Tervezet: 'Egyeztetés folyamatban',
  'Tárgyalás alatt': 'Egyeztetés folyamatban',
  Kiküldve: 'Kiküldve, aláírásra vár'
};

export function normalizeContract(status) {
  if (!status) return 'Nincs még';
  return LEGACY[status] || status;
}

export function contractBadge(status) {
  return CONTRACT_STATUSES.find(c => c.value === normalizeContract(status))?.badge || 'badge-gray';
}

export const CONTRACT_PENDING = ['Egyeztetés folyamatban', 'Kiküldve, aláírásra vár'];
