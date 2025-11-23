import type { APIRoute } from 'astro';
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.GEMINI_API_KEY;

export const GET: APIRoute = async () => {
  if (!API_KEY) {
    return new Response(JSON.stringify({ 
        status: "error", 
        message: "API Key 未配置。请检查 .env 文件。" 
    }), { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: "Reply with only the word 'Connected'." }] }],
    });

    // 修正：根据最新 SDK，response.text 可能是一个 getter 属性或者需要从 candidates 获取
    // 安全起见，我们尝试多种获取方式，并打印结构以便调试
    let text = "";
    if (typeof response.text === 'function') {
        text = response.text();
    } else if (typeof response.text === 'string') {
        text = response.text;
    } else if (response.candidates && response.candidates.length > 0) {
        // Fallback 到最原始的结构
        text = response.candidates[0].content.parts[0].text;
    } else {
        text = JSON.stringify(response); // 兜底显示完整对象
    }

    return new Response(JSON.stringify({
      status: "success",
      model: "gemini-2.5-flash",
      response: text,
      message: "恭喜！你的服务器可以成功连接到 Gemini。"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      status: "error",
      message: "连接失败",
      details: error instanceof Error ? error.message : String(error),
      tip: "如果你在中国大陆，这通常是因为终端/Node环境没有走代理。请尝试在启动命令前加代理，如: export https_proxy=http://127.0.0.1:7890"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
