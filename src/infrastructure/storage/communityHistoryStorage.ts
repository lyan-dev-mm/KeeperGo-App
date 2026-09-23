import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'community_history';
const MAX_ITEMS = 5;

export interface HistoryItem {
  communityId: string;
  communityName: string;
  color: string;
  viewedAt: string; // ISO string
}

export async function getCommunityHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export async function addToCommunityHistory(item: Omit<HistoryItem, 'viewedAt'>): Promise<void> {
  try {
    const current = await getCommunityHistory();
    // Quitar si ya existía
    const filtered = current.filter((h) => h.communityId !== item.communityId);
    // Agregar al inicio con timestamp
    const newItem: HistoryItem = { ...item, viewedAt: new Date().toISOString() };
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silencioso
  }
}

export async function clearCommunityHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silencioso
  }
}