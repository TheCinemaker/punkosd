import {
  Home, Calendar, Users, Building2, MapPin, CheckSquare, ShoppingCart, Wine,
  Package, Music, DollarSign, History, UserCheck, Phone
} from 'lucide-react';

// Menüpontok; `collection` = melyik adatlistához tartozik (globális kereséshez)
export const TABS = [
  { id: 'dashboard', label: 'Most', longLabel: 'Most — Áttekintés', icon: Home },
  { id: 'schedule', label: 'Menetrend', longLabel: 'Menetrend & Színpadok', icon: Calendar, collection: 'schedule' },
  { id: 'tasks', label: 'Feladatok', longLabel: 'Feladatok', icon: CheckSquare, collection: 'tasks' },
  { id: 'contacts', label: 'Telefonkönyv', longLabel: 'Telefonkönyv', icon: Phone },
  { id: 'artists', label: 'Fellépők', longLabel: 'Fellépők & Riderek', icon: Users, collection: 'artists' },
  { id: 'map', label: 'Helyszínrajz', longLabel: 'Helyszínrajz & Standok', icon: MapPin, collection: 'mapPoints' },
  { id: 'shopping', label: 'Beszerzés', longLabel: 'Beszerzés & Anyagigény', icon: ShoppingCart, collection: 'shoppingList' },
  { id: 'contractors', label: 'Szolgáltatók', longLabel: 'Szolgáltatók & Szerződések', icon: Building2, collection: 'contractors' },
  { id: 'vendors', label: 'Árusok', longLabel: 'Árusok & Közművek', icon: Wine, collection: 'vendors' },
  { id: 'inventory', label: 'Készlet', longLabel: 'Készlet & Zsákok', icon: Package, collection: 'inventory' },
  { id: 'team', label: 'Stáb', longLabel: 'Szervezők & Stáb', icon: UserCheck, collection: 'users' },
  { id: 'budget', label: 'Költségvetés', longLabel: 'Pályázati Költségvetés', icon: DollarSign, collection: 'budget' },
  { id: 'tracklist', label: 'Tracklist', longLabel: 'Tracklist & Artisjus', icon: Music, collection: 'tracklist' },
  { id: 'logs', label: 'Napló', longLabel: 'Aktivitási Napló', icon: History, collection: 'logs' }
];

// Mobilon az alsó sávban ezek látszanak, a többi a "Több" menüben
export const MOBILE_PRIMARY = ['dashboard', 'schedule', 'tasks', 'contacts'];
