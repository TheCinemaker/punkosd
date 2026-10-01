// Központi adattár: soronkénti mentés a Supabase `fest_records` táblába,
// élő szinkron (Realtime), offline kimenő sor, és helyi gyorsítótár.
// Supabase nélkül helyi módban fut (localStorage + böngészőfülek közti szinkron).
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured, getLocalData, setLocalData, removeLocalData } from './supabase';

const TABLE = 'fest_records';
const META = '_meta';
const OUTBOX_KEY = 'outbox';
const LOCAL_CHANNEL = 'ktsze_festival_local_v2';
const NEWEST_FIRST = new Set(['tasks', 'shoppingList', 'incidents', 'logs', 'trash', 'notices']);
const APPEND_ONLY = new Set(['logs']);
const LOG_LIMIT = 1000;
const RETRY_MS = 5000;
// Emeld meg, ha a kezdő adatkészlet lecserélődik: a régi helyi adat egyszer törlődik minden eszközön
const DATA_VERSION = 3;

function resetOutdatedLocalData(keys) {
  if (getLocalData('dataVersion', 1) === DATA_VERSION) return;
  keys.forEach(removeLocalData);
  removeLocalData(OUTBOX_KEY);
  setLocalData('dataVersion', DATA_VERSION);
}

let lastSort = 0;
function nextSort() {
  const now = Date.now();
  lastSort = now > lastSort ? now : lastSort + 1;
  return lastSort;
}

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function sortItems(key, items) {
  const dir = NEWEST_FIRST.has(key) ? -1 : 1;
  return [...items].sort((a, b) => dir * ((a._sort ?? 0) - (b._sort ?? 0)));
}

// Régi (sorrendkulcs nélküli) listák: a jelenlegi sorrend megtartásával kapnak kulcsot
function ensureSort(key, items) {
  if (!Array.isArray(items)) return [];
  if (items.every(it => it._sort != null)) return items;
  const n = items.length;
  return items.map((it, i) => (it._sort != null ? it : { ...it, _sort: NEWEST_FIRST.has(key) ? n - i : i + 1 }));
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function useFestivalStore(collections, { currentUser, onRemoteInsert } = {}) {
  const keys = Object.keys(collections);

  const [data, setData] = useState(() => {
    resetOutdatedLocalData(keys);
    const out = {};
    keys.forEach(key => { out[key] = sortItems(key, ensureSort(key, getLocalData(key, collections[key]))); });
    return out;
  });
  const dataRef = useRef(data);
  const outboxRef = useRef(getLocalData(OUTBOX_KEY, {}));
  const [status, setStatus] = useState(isSupabaseConfigured ? 'connecting' : 'local');
  const [pendingCount, setPendingCount] = useState(() => Object.keys(outboxRef.current).length);

  const userRef = useRef(currentUser);
  userRef.current = currentUser;
  const onRemoteInsertRef = useRef(onRemoteInsert);
  onRemoteInsertRef.current = onRemoteInsert;

  const flushingRef = useRef(false);
  const retryTimerRef = useRef(null);
  const channelRef = useRef(null);

  const liveStatus = () => (channelRef.current?.state === 'joined' ? 'online' : 'connecting');

  const commitMany = useCallback((changes) => {
    const next = { ...dataRef.current, ...changes };
    dataRef.current = next;
    setData(next);
    Object.entries(changes).forEach(([key, items]) => setLocalData(key, items));
  }, []);

  const saveOutbox = useCallback(() => {
    setLocalData(OUTBOX_KEY, outboxRef.current);
    setPendingCount(Object.keys(outboxRef.current).length);
  }, []);

  const flush = useCallback(async () => {
    if (!isSupabaseConfigured || flushingRef.current) return;
    const snapshot = { ...outboxRef.current };
    const entries = Object.entries(snapshot);
    if (entries.length === 0) return;
    flushingRef.current = true;
    try {
      const upserts = entries.filter(([, e]) => e.op === 'upsert').map(([, e]) => ({
        collection: e.collection,
        id: e.id,
        data: e.data,
        updated_by: e.by,
        updated_at: e.at
      }));
      for (let i = 0; i < upserts.length; i += 500) {
        const { error } = await supabase.from(TABLE).upsert(upserts.slice(i, i + 500), { onConflict: 'collection,id' });
        if (error) throw error;
      }
      const deletesByCollection = {};
      entries.filter(([, e]) => e.op === 'delete').forEach(([, e]) => {
        (deletesByCollection[e.collection] = deletesByCollection[e.collection] || []).push(e.id);
      });
      for (const [collection, ids] of Object.entries(deletesByCollection)) {
        const { error } = await supabase.from(TABLE).delete().eq('collection', collection).in('id', ids);
        if (error) throw error;
      }
      // Csak azt töröljük a sorból, ami közben nem változott
      entries.forEach(([k, e]) => { if (outboxRef.current[k] === e) delete outboxRef.current[k]; });
      saveOutbox();
      setStatus(s => (s === 'offline' ? liveStatus() : s));
    } catch (err) {
      console.warn('Mentés sikertelen, újrapróbálás később:', err?.message || err);
      setStatus('offline');
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => flush(), RETRY_MS);
    } finally {
      flushingRef.current = false;
      if (Object.values(outboxRef.current).some(e => !Object.values(snapshot).includes(e))) {
        setTimeout(() => flush(), 0);
      }
    }
  }, [saveOutbox]);

  const enqueue = useCallback((ops) => {
    const at = new Date().toISOString();
    const by = userRef.current || 'Rendszer';
    ops.forEach(op => { outboxRef.current[`${op.collection}::${op.id}`] = { ...op, at, by }; });
    saveOutbox();
    flush();
  }, [flush, saveOutbox]);

  // Szerverről jött sorok alkalmazása (a még el nem küldött helyi módosítások elsőbbséget élveznek)
  const applyServerRows = useCallback((rows) => {
    const grouped = {};
    keys.forEach(k => { grouped[k] = []; });
    const meta = new Set();
    rows.forEach(r => {
      if (r.collection === META) meta.add(r.id);
      else if (grouped[r.collection]) grouped[r.collection].push(r.data);
    });

    const changes = {};
    const seedOps = [];
    keys.forEach(key => {
      if (grouped[key].length === 0 && !meta.has(`seeded:${key}`)) {
        // Üres adatbázis: a kezdő adatkészlet feltöltése (sosem egy eszköz régi helyi adata)
        const seed = sortItems(key, ensureSort(key, collections[key]));
        changes[key] = seed;
        seed.forEach(item => seedOps.push({ op: 'upsert', collection: key, id: item.id, data: item }));
        seedOps.push({ op: 'upsert', collection: META, id: `seeded:${key}`, data: { seededAt: new Date().toISOString() } });
        return;
      }
      const byId = new Map(grouped[key].map(it => [it.id, it]));
      Object.values(outboxRef.current).forEach(e => {
        if (e.collection !== key) return;
        if (e.op === 'upsert') byId.set(e.id, e.data);
        else byId.delete(e.id);
      });
      let items = sortItems(key, ensureSort(key, [...byId.values()]));
      if (key === 'logs') items = items.slice(0, LOG_LIMIT);
      if (!same(items, dataRef.current[key])) changes[key] = items;
    });
    if (Object.keys(changes).length) commitMany(changes);
    if (seedOps.length) enqueue(seedOps);
  }, [keys.join('|'), commitMany, enqueue]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const rows = [];
      const page = 1000;
      for (let from = 0; ; from += page) {
        const { data: chunk, error } = await supabase
          .from(TABLE)
          .select('collection,id,data')
          .order('collection')
          .order('id')
          .range(from, from + page - 1);
        if (error) throw error;
        rows.push(...chunk);
        if (chunk.length < page) break;
      }
      applyServerRows(rows);
      setStatus(s => (s === 'offline' || s === 'connecting' ? liveStatus() : s));
    } catch (err) {
      console.warn('Betöltés sikertelen:', err?.message || err);
      setStatus('offline');
    }
  }, [applyServerRows]);

  // Élő kapcsolat, első betöltés, újracsatlakozás
  useEffect(() => {
    if (!isSupabaseConfigured) {
      let bc = null;
      try { bc = new BroadcastChannel(LOCAL_CHANNEL); } catch { /* nem támogatott */ }
      if (bc) {
        bc.onmessage = (ev) => {
          const { key, items } = ev.data || {};
          if (key && dataRef.current[key]) commitMany({ [key]: items });
        };
      }
      channelRef.current = bc;
      return () => bc && bc.close();
    }

    let hadDisconnect = false;
    let hiddenAt = 0;

    const channel = supabase
      .channel('fest_records_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const { collection, id } = payload.old || {};
          if (!dataRef.current[collection] || outboxRef.current[`${collection}::${id}`]) return;
          const cur = dataRef.current[collection];
          if (!cur.some(i => i.id === id)) return;
          commitMany({ [collection]: cur.filter(i => i.id !== id) });
          return;
        }
        const row = payload.new;
        if (!row || !dataRef.current[row.collection] || outboxRef.current[`${row.collection}::${row.id}`]) return;
        const cur = dataRef.current[row.collection];
        const existing = cur.find(i => i.id === row.id);
        if (existing && same(existing, row.data)) return;
        let items = existing ? cur.map(i => (i.id === row.id ? row.data : i)) : [...cur, row.data];
        items = sortItems(row.collection, items);
        if (row.collection === 'logs') items = items.slice(0, LOG_LIMIT);
        commitMany({ [row.collection]: items });
        if (!existing && row.updated_by !== userRef.current) {
          onRemoteInsertRef.current?.(row.collection, row.data, row.updated_by);
        }
      })
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          setStatus('online');
          if (hadDisconnect) { hadDisconnect = false; flush(); reload(); }
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
          hadDisconnect = true;
          setStatus('offline');
        }
      });
    channelRef.current = channel;

    reload();
    flush();

    const onOnline = () => { flush(); reload(); };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 60000) { flush(); reload(); }
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(retryTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Egy teljes lista frissítése: csak a ténylegesen változott sorok mennek a szerverre
  const update = useCallback((key, newItems) => {
    const prev = dataRef.current[key] || [];
    let items = newItems.map(it => (it._sort == null ? { ...it, _sort: nextSort() } : it));
    items = sortItems(key, items);
    if (key === 'logs') items = items.slice(0, LOG_LIMIT);

    const prevById = new Map(prev.map(it => [it.id, it]));
    const nextIds = new Set(items.map(it => it.id));
    const ops = [];
    items.forEach(it => {
      const p = prevById.get(it.id);
      if (!p || !same(p, it)) ops.push({ op: 'upsert', collection: key, id: it.id, data: it });
    });
    if (!APPEND_ONLY.has(key)) {
      prev.forEach(it => { if (!nextIds.has(it.id)) ops.push({ op: 'delete', collection: key, id: it.id }); });
    }

    commitMany({ [key]: items });

    if (isSupabaseConfigured) {
      if (ops.length) enqueue(ops);
    } else {
      try { channelRef.current?.postMessage({ key, items }); } catch { /* nincs más fül */ }
    }
  }, [commitMany, enqueue]);

  const get = useCallback((key) => dataRef.current[key] || [], []);

  return { data, update, get, status, pendingCount };
}
