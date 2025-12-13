import type { SpreadConfig, TarotCard } from './tarotData';

export interface HistoryItem {
  id: string; // timestamp
  date: string; // ISO string
  spreadId: string;
  spreadName: string;
  question: string;
  cards: {
    card: TarotCard;
    isReversed: boolean;
    positionName: string;
  }[];
  aiResponse: string | null; // markdown content, null if pending/failed
}

const HISTORY_KEY = 'ether_tarot_history';

// 获取所有历史记录
export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored).sort((a: HistoryItem, b: HistoryItem) => 
      parseInt(b.id) - parseInt(a.id)
    );
  } catch (e) {
    console.error('Failed to parse history', e);
    return [];
  }
};

// 保存新的记录 (初始状态，AI 回答为空)
export const saveReading = (
  spread: SpreadConfig,
  question: string,
  drawnCards: { card: TarotCard; isReversed: boolean }[]
): string => {
  const history = getHistory();
  const id = Date.now().toString();
  
  const newItem: HistoryItem = {
    id,
    date: new Date().toISOString(),
    spreadId: spread.id,
    spreadName: spread.name,
    question,
    cards: drawnCards.map((c, i) => ({
      card: c.card,
      isReversed: c.isReversed,
      positionName: spread.positionNames[i] || `Position ${i + 1}`
    })),
    aiResponse: null
  };

  const newHistory = [newItem, ...history];
  
  // 限制最大条数 (如5条)，超过则截断
  if (newHistory.length > 5) {
      newHistory.length = 5;
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.warn('Failed to save reading history (possibly storage full):', error);
  }
  return id;
};

// 更新记录 (填充 AI 回答)
export const updateReading = (id: string, aiResponse: string) => {
  const history = getHistory();
  const index = history.findIndex(item => item.id === id);
  
  if (index !== -1) {
    history[index].aiResponse = aiResponse;
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.warn('Failed to update reading history:', error);
    }
  }
};

// 删除单条记录
export const deleteReading = (id: string) => {
    const history = getHistory();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

// 清空所有
export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

