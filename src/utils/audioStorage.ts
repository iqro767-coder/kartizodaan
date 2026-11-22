const DB_NAME = 'mylife_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'custom_audios';

export interface StoredAudioRecord {
  id: string;
  name: string;
  mimeType: string;
  blob: Blob;
  createdAt: number;
}

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomAudio(file: File): Promise<StoredAudioRecord> {
  const db = await openAudioDb();
  const record: StoredAudioRecord = {
    id: `audio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    mimeType: file.type || 'audio/mpeg',
    blob: file,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCustomAudio(id: string): Promise<StoredAudioRecord | null> {
  const db = await openAudioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve((req.result as StoredAudioRecord) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function listCustomAudios(): Promise<Array<Omit<StoredAudioRecord, 'blob'>>> {
  try {
    const db = await openAudioDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const rows = (req.result as StoredAudioRecord[]) || [];
        resolve(
          rows
            .map(({ id, name, mimeType, createdAt }) => ({ id, name, mimeType, createdAt }))
            .sort((a, b) => b.createdAt - a.createdAt),
        );
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteCustomAudio(id: string): Promise<void> {
  try {
    const db = await openAudioDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}
