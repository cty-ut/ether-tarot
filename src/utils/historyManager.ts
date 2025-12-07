import type { ReadingResult } from './aiClient';
import type { TarotCard } from './tarotData';

export interface HistoryRecord {
  id: number; // timestamp
  date: string; // formatted date string
  spreadId: string; // e.g., 'time-flow'
  cards: { card: TarotCard; isReversed: boolean }[];
  question: string;
  result: ReadingResult | null;
  isError: boolean;
}

const HISTORY_KEY = 'ether_tarot_history';
const MAX_HISTORY_ITEMS = 5;

export const HistoryManager = {
  getHistory: (): HistoryRecord[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse history", e);
      return [];
    }
  },

  saveHistory: (record: Omit<HistoryRecord, 'id' | 'date'>): number => {
    try {
      const currentHistory = HistoryManager.getHistory();
      const newId = Date.now();
      const newRecord: HistoryRecord = {
        ...record,
        id: newId,
        date: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      };

      // Add new record to the beginning
      const updatedHistory = [newRecord, ...currentHistory];

      // Keep only the latest MAX_HISTORY_ITEMS
      if (updatedHistory.length > MAX_HISTORY_ITEMS) {
        updatedHistory.length = MAX_HISTORY_ITEMS;
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return newId;
    } catch (e) {
      console.error("Failed to save history", e);
      return 0;
    }
  },

  updateRecord: (id: number, newResult: ReadingResult, isError: boolean) => {
      try {
          const currentHistory = HistoryManager.getHistory();
          const index = currentHistory.findIndex(r => r.id === id);
          if (index !== -1) {
              currentHistory[index].result = newResult;
              currentHistory[index].isError = isError;
              localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
          }
      } catch (e) {
          console.error("Failed to update history record", e);
      }
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  }
};

