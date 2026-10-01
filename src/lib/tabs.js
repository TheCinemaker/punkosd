import {
  Home, Calendar, Users, Building2, MapPin, CheckSquare, ShoppingCart, Wine,
  Package, DollarSign, History, UserCheck, Phone, FileCheck, ShieldCheck
} from 'lucide-react';

// Menüpontok csoportokba rendezve; `collection` = melyik adatlistához tartozik (globális kereséshez)
export const TABS = [
  { id: 'dashboard', group: 'Élő', label: 'Most', longLabel: 'Most — Áttekintés', icon: Home },
  { id: 'tasks', group: 'Élő', label: 'Feladatok', longLabel: 'Feladatok', icon: CheckSquare, collection: 'tasks' },
  { id: 'contacts', group: 'Élő', label: 'Telefonkönyv', longLabel: 'Telefonkönyv', icon: Phone },

  { id: 'schedule', group: 'Program', label: 'Menetrend', longLabel: 'Menetrend & Színpadok', icon: Calendar, collection: 'schedule' },
  { id: 'artists', group: 'Program', label: 'Fellépők', longLabel: 'Fellépők & Riderek', icon: Users, collection: 'artists' },

  { id: 'map', group: 'Helyszín & produkció', label: 'Helyszínrajz', longLabel: 'Helyszínrajz', icon: MapPin, collection: 'mapPoints' },
  { id: 'vendors', group: 'Helyszín & produkció', label: 'Árusok', longLabel: 'Árusok', icon: Wine, collection: 'vendors' },
  { id: 'contractors', group: 'Helyszín & produkció', label: 'Szolgáltatók', longLabel: 'Szolgáltatók & Szerződések', icon: Building2, collection: 'contractors' },
  { id: 'permits', group: 'Helyszín & produkció', label: 'Engedélyek', longLabel: 'Engedélyek & Ügyintézés', icon: FileCheck, collection: 'permits' },
  { id: 'shopping', group: 'Helyszín & produkció', label: 'Beszerzés', longLabel: 'Beszerzés & Anyagigény', icon: ShoppingCart, collection: 'shoppingList' },
  { id: 'inventory', group: 'Helyszín & produkció', label: 'Készlet', longLabel: 'Készlet & Zsákok', icon: Package, collection: 'inventory' },

  { id: 'budget', group: 'Pénzügy', label: 'Költségvetés', longLabel: 'Pályázati Költségvetés', icon: DollarSign, collection: 'budget' },

  { id: 'team', group: 'Csapat', label: 'Stáb', longLabel: 'Szervezők & Stáb', icon: UserCheck, collection: 'users' },

  { id: 'logs', group: 'Rendszer', label: 'Napló', longLabel: 'Aktivitási Napló', icon: History, collection: 'logs' },
  { id: 'trash', group: 'Rendszer', label: 'Lomtár', longLabel: 'Lomtár & Mentés', icon: ShieldCheck }
];

// Mobilon az alsó sávban ezek látszanak, a többi a "Több" menüben
export const MOBILE_PRIMARY = ['dashboard', 'schedule', 'tasks', 'contacts'];
