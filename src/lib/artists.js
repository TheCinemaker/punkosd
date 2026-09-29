import { docUrl } from './files';

// A menetrend-tétel fellépője: azonosító szerint, régi adatnál név szerint
export function findArtist(artists, item) {
  if (!item) return null;
  if (item.artistId) {
    const byId = artists.find(a => a.id === item.artistId);
    if (byId) return byId;
  }
  const name = (item.artist || '').trim().toLowerCase();
  return name ? artists.find(a => a.name.trim().toLowerCase() === name) || null : null;
}

export function hasRider(artist) {
  if (!artist) return false;
  return Boolean(docUrl(artist.techRiderDoc)) || (artist.techRider || '').startsWith('Jóváhagyva');
}

export function isContractSigned(artist) {
  return Boolean(artist && artist.contractStatus === 'Aláírva');
}

export function telHref(phone) {
  const clean = (phone || '').replace(/[^\d+]/g, '');
  return clean.length >= 6 ? `tel:${clean}` : null;
}
