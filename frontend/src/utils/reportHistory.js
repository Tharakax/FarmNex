// utils/reportHistory.js
// Simple report history persistence using localStorage

const STORAGE_KEY = 'reportHistory';

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export function addEntry(entry) {
  const now = new Date();
  const item = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    name: entry.name || 'Report',
    type: entry.type || 'General',
    format: entry.format || 'pdf',
    date: entry.date || now.toISOString().split('T')[0],
    size: entry.size || '-',
    downloads: entry.downloads ?? 1,
  };
  const list = getHistory();
  list.unshift(item);
  // keep last 30
  const trimmed = list.slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export default { getHistory, addEntry, clearHistory };
