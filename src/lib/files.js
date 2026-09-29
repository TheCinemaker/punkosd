import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET = 'fest-docs';
const LOCAL_LIMIT_BYTES = 1024 * 1024;

function safeFileName(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_');
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Feltöltés a Supabase Storage-ba; helyi módban (Supabase nélkül) kis fájlok a böngészőben maradnak
export async function uploadDocument(file, folder) {
  const meta = { name: file.name, size: file.size, uploadedAt: new Date().toISOString() };

  if (isSupabaseConfigured) {
    const path = `${folder}/${Date.now()}_${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false
    });
    if (error) throw new Error(`Feltöltés sikertelen: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { ...meta, path, url: data.publicUrl };
  }

  if (file.size > LOCAL_LIMIT_BYTES) {
    throw new Error('Supabase nélkül csak 1 MB alatti fájl tárolható. Állítsd be a Supabase kapcsolatot!');
  }
  return { ...meta, url: await readAsDataUrl(file) };
}

// A régi adatokban a dokumentum csak egy fájlnév (szöveg) volt
export function docName(doc) {
  if (!doc) return '';
  return typeof doc === 'string' ? doc : doc.name;
}

export function docUrl(doc) {
  return doc && typeof doc === 'object' ? doc.url : null;
}
