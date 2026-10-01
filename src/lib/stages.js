import { STAGES as DEFAULT_STAGES } from './initialData';

// Az aktuális helyszínlista. Az App minden rendereléskor frissíti az adattárból,
// a nézetek innen olvassák (így nem kell minden komponensen átadogatni).
let current = DEFAULT_STAGES;

export function setStages(list) {
  current = [...(list && list.length ? list : DEFAULT_STAGES)].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getStages() {
  return current;
}

export function getStage(id) {
  return current.find(s => s.id === id) || null;
}

export function stageShortName(id) {
  const s = getStage(id);
  return s ? s.name.split('(')[0].trim() : (id || '—');
}

export function isParallelStage(id) {
  return Boolean(getStage(id)?.parallel);
}
