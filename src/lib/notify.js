// Böngésző-értesítés + rezgés (SOS-hoz). Háttérben lévő fülön / telepített appban is megjelenik.
export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export async function notify(title, body) {
  try { navigator.vibrate?.([250, 120, 250]); } catch { /* nem támogatott */ }
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const options = { body, icon: '/icon.svg', badge: '/icon.svg', tag: `sos-${Date.now()}`, renotify: true };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { await reg.showNotification(title, options); return; }
  } catch { /* nincs service worker */ }
  try { new Notification(title, options); } catch { /* mobilon csak service workerrel megy */ }
}
