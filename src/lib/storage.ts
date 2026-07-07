import { DiaryData, DiaryEntry } from './types';

const STORAGE_KEY = 'diary-calendar-data';

export const storage = {
  getData: (): DiaryData => {
    if (typeof window === 'undefined') return { entries: [] };
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { entries: [] };
    } catch {
      return { entries: [] };
    }
  },

  saveEntry: (entry: DiaryEntry): void => {
    if (typeof window === 'undefined') return;
    const data = storage.getData();
    const existingIndex = data.entries.findIndex((e) => e.date === entry.date);
    if (existingIndex >= 0) {
      data.entries[existingIndex] = entry;
    } else {
      data.entries.push(entry);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getEntry: (date: string): DiaryEntry | undefined => {
    const data = storage.getData();
    return data.entries.find((e) => e.date === date);
  },

  deleteEntry: (date: string): void => {
    if (typeof window === 'undefined') return;
    const data = storage.getData();
    data.entries = data.entries.filter((e) => e.date !== date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  exportData: (): string => {
    return JSON.stringify(storage.getData(), null, 2);
  },

  importData: (jsonString: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const data = JSON.parse(jsonString);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      throw new Error('Invalid JSON format');
    }
  },
};
