// Kezdő adatkészlet: csak a stáb és a színpadok. Minden más üresen indul,
// és a valós adatokat az appban kell felvinni.
import { FESTIVAL } from './config';

// A PIN-t mindenki cserélje le az első belépés után (Stáb menü)!
export const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Szilveszter', role: 'Szervező', badge: 'Technika', phone: '', email: '', pin: '1532', radio: '' },
  { id: 'usr-2', name: 'Gábor', role: 'Elnök, főszervező', badge: 'Elnökség', phone: '', email: '', pin: '1532', radio: '' },
  { id: 'usr-3', name: 'Robi', role: 'Szervező', badge: 'Helyszín', phone: '', email: '', pin: '1532', radio: '' },
  { id: 'usr-4', name: 'Péter', role: 'Szervező', badge: 'Helyszín', phone: '', email: '', pin: '1532', radio: '' },
  { id: 'usr-5', name: 'Adrienn', role: 'Szervező', badge: 'Helyszín', phone: '', email: '', pin: '1532', radio: '' },
  { id: 'usr-6', name: 'Bea', role: 'Szervező', badge: 'Helyszín', phone: '', email: '', pin: '1532', radio: '' }
];

// Kezdő helyszínlista — az appban (Menetrend → Helyszínek) szerkeszthető, bővíthető
export const STAGES = [
  { id: 'main_stage', name: 'Nagyszínpad (Fő tér)', location: 'Fő tér', capacity: '', parallel: false, order: 1, lat: 47.388091209174306, lng: 16.54176324306651 },
  { id: 'small_stage_1', name: 'Kisszínpad 1 (Jurisics tér)', location: 'Jurisics tér', capacity: '', parallel: false, order: 2, lat: 47.388757161379104, lng: 16.54120497730775 },
  { id: 'small_stage_2', name: 'Kisszínpad 2 (Várjátszótér)', location: 'Várjátszótér & Várárok', capacity: '', parallel: false, order: 3, lat: 47.388416783237474, lng: 16.538928064418478 },
  { id: 'street_points', name: 'Belvárosi kapualjak', location: 'Kapualjak & sétányok', capacity: '', parallel: true, order: 4, lat: null, lng: null }
];

export const DAYS = FESTIVAL.days.map(d => d.name);

export const INITIAL_SCHEDULE = [];
export const INITIAL_ARTISTS = [];
export const INITIAL_VENDORS = [];
export const INITIAL_TASKS = [];
export const INITIAL_INVENTORY = [];
export const INITIAL_BUDGET = [];
export const INITIAL_LOGS = [];
export const INITIAL_CONTRACTORS = [];
export const INITIAL_INCIDENTS = [];
export const INITIAL_SHOPPING_LIST = [];

// Infrastruktúra-pontok (áram, víz, WC, mentő...) — a térképen a „Pontok szerkesztése” gombbal vehetők fel.
// A színpadok helye a config.js-ben van, az árusok helye az árus adatlapján.
export const MAP_POINTS = [];
