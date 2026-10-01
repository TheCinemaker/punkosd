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

export const STAGES = [
  { id: 'main_stage', name: 'Nagyszínpad (Fő tér)', location: 'Fő tér (Borok helyszíne)', type: 'Nagyszínpad', capacity: '4000 fő' },
  { id: 'small_stage_1', name: 'Kisszínpad 1 (Jurisics tér)', location: 'Jurisics tér (Ételek utcája)', type: 'Utcazene & Akusztik', capacity: '1200 fő' },
  { id: 'small_stage_2', name: 'Kisszínpad 2 (Várjátszótér)', location: 'Várjátszótér & Várárok', type: 'Gyerekbirodalom', capacity: '800 fő' },
  { id: 'street_points', name: 'Belvárosi Kapualjak', location: 'Kapualjak & Sétányok', type: 'Egyedi Zenészek', capacity: '200 fő' },
];

export const DAYS = FESTIVAL.days.map(d => d.name);

export const INITIAL_SCHEDULE = [];
export const INITIAL_ARTISTS = [];
export const INITIAL_VENDORS = [];
export const INITIAL_TASKS = [];
export const INITIAL_INVENTORY = [];
export const INITIAL_TRACKLIST = [];
export const INITIAL_BUDGET = [];
export const INITIAL_LOGS = [];
export const INITIAL_CONTRACTORS = [];
export const INITIAL_INCIDENTS = [];
export const INITIAL_SHOPPING_LIST = [];

// Infrastruktúra-pontok (áram, víz, WC, mentő...) — a térképen a „Pontok szerkesztése” gombbal vehetők fel.
// A színpadok helye a config.js-ben van, az árusok helye az árus adatlapján.
export const MAP_POINTS = [];
