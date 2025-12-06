import type { TarotCard } from './tarotData';

export interface ReadingResult {
  summary: string;
  keywords: string[];
  detailed_interpretation: string;
  advice: string;
}

export async function getTarotReading(
    question: string, 
    cards: { card: TarotCard; isReversed: boolean }[],
    spreadId?: string // 新增参数
): Promise<ReadingResult> {
  try {
    // 请求本地 Astro API Route
    console.log("Sending request to /api/reading with:", { question, cards, spreadId });
    const response = await fetch('/api/reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, cards, spreadId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data as ReadingResult;

  } catch (error) {
    console.error("AI Client Error:", error);
    return {
        summary: "连接被干扰",
        keywords: ["Network Error"],
        detailed_interpretation: "似乎有什么力量阻挡了信号的传递。请检查你的网络连接，或者稍后再试。\n\n(这通常是因为本地开发环境无法连接到 Gemini 服务器，请确保你的终端已配置代理)",
        advice: "深呼吸，稍后再试。"
    };
  }
}
