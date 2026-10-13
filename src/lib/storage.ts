import { get, set, del, keys, createStore } from 'idb-keyval';
import type { AppSettings, Sheet } from '../types/sheet';
import { DEFAULT_SETTINGS } from '../types/sheet';

// A single object store holds everything, with keys namespaced by kind
// ("sheet:<id>" / "settings"). idb-keyval only creates a store's schema
// during a version upgrade, so opening the same DB name twice with two
// different store names silently leaves the second store missing.
// Renamed (v2) because "voice-sheet-db" was created under that broken
// two-store schema during development and left half-initialized.
const store = createStore('voice-sheet-db-v2', 'kv');

const SETTINGS_KEY = 'settings';
const sheetKey = (id: string) => `sheet:${id}`;

export async function listSheets(): Promise<Sheet[]> {
  const allKeys = await keys(store);
  const sheetKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith('sheet:'));
  const sheets = await Promise.all(sheetKeys.map((k) => get<Sheet>(k, store)));
  return sheets
    .filter((s): s is Sheet => Boolean(s))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function loadSheet(id: string): Promise<Sheet | undefined> {
  return get<Sheet>(sheetKey(id), store);
}

export async function saveSheet(sheet: Sheet): Promise<void> {
  await set(sheetKey(sheet.id), sheet, store);
}

export async function deleteSheet(id: string): Promise<void> {
  await del(sheetKey(id), store);
}

export async function loadSettings(): Promise<AppSettings> {
  const stored = await get<AppSettings>(SETTINGS_KEY, store);
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await set(SETTINGS_KEY, settings, store);
}

/**
 * Wipes the local database. Used as a one-time recovery path for browsers
 * that already created "voice-sheet-db" under the old (broken) two-store
 * schema, where the "kv" store above would otherwise never get created.
 */
function resetDatabase(): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase('voice-sheet-db-v2');
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

export async function loadInitialState(): Promise<{ sheets: Sheet[]; settings: AppSettings }> {
  try {
    const [sheets, settings] = await Promise.all([listSheets(), loadSettings()]);
    return { sheets, settings };
  } catch {
    await resetDatabase();
    return { sheets: [], settings: DEFAULT_SETTINGS };
  }
}
