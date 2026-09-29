import { telHref } from './artists';

// Melyik szolgáltató felel az adott típusú pontért (a hibához a jó szerelő hívása jöjjön fel)
const RESPONSIBLE = {
  power: { label: 'Villanyszerelő', match: /villany|áram|e\.on|aggreg/i },
  toilet: { label: 'WC-szerviz', match: /wc|higiénia|toi/i },
  waste: { label: 'Hulladékszállító', match: /hulladék|kukás/i },
  medical: { label: 'Mentőszolgálat', match: /mentő|egészség/i },
  stage: { label: 'Színpadtechnika', match: /színpad|hangtechn/i },
  backstage: { label: 'Színpadtechnika', match: /színpad|hangtechn/i },
  wine: { label: 'Villanyszerelő', match: /villany|áram|e\.on|aggreg/i },
  food: { label: 'Villanyszerelő', match: /villany|áram|e\.on|aggreg/i },
  water: { label: 'Vízszolgáltató', match: /víz|városüzemeltetés/i }
};

export function responsibleCalls(contractors, type) {
  const rule = RESPONSIBLE[type];
  if (!rule) return [];
  return contractors
    .filter(c => rule.match.test(`${c.category} ${c.service || ''}`) && telHref(c.phone))
    .slice(0, 2)
    .map(c => ({ label: `${rule.label} hívása`, name: c.companyName, person: c.contactName, phone: c.phone }));
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
