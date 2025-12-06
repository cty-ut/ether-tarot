import React, { forwardRef } from 'react';
import type { ReadingResult } from '../../utils/aiClient';
import type { TarotCard, SpreadConfig } from '../../utils/tarotData';

interface ShareCardProps {
  question: string;
  cards: { card: TarotCard; isReversed: boolean }[];
  result: ReadingResult;
  spreadConfig: SpreadConfig;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ question, cards, result, spreadConfig }, ref) => {
  // 辅助截断函数，因为 html2canvas 不支持 line-clamp
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  // 辅助函数：从二选一问题字符串中解析选项
  const parseChoiceQuestion = (q: string) => {
    const matchA = q.match(/CHOICE_A:(.*?)\|/);
    const matchB = q.match(/CHOICE_B:(.*?)\|/);
    
    if (matchA && matchB) {
        return {
            optionA: matchA[1],
            optionB: matchB[1]
        };
    }
    return null;
  };

  // 动态计算每张卡牌的宽度类
  const getCardWidthClass = (total: number) => {
    if (total === 1) return "w-2/3 max-w-[160px]"; // 单张特别大
    if (total === 2) return "w-[45%]";
    if (total === 3) return "w-[30%]";
    if (total === 4) return "w-[45%]"; // 2x2
    if (total === 5) return "w-[30%]"; // 二选一比较挤
    return "w-[30%]";
  };

  const cardWidthClass = getCardWidthClass(cards.length);
  const choices = spreadConfig.id === 'choice-guidance' ? parseChoiceQuestion(question) : null;

  return (
    <div 
      ref={ref}
      className="w-[360px] bg-[#0a0a0a] text-white p-5 flex flex-col items-center relative"
      style={{ 
        fontFamily: 'serif',
        backgroundImage: 'radial-gradient(circle at center, #111111 0%, #000000 100%)'
      }}
    >
      {/* 背景装饰 - 极简星空 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{ 
              backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
              backgroundSize: '40px 40px'
           }} 
      />
      
      {/* 边框装饰 - 自动贴合内容区域 */}
      <div className="absolute inset-4 border border-mystic-gold/30 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-mystic-gold"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-mystic-gold"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-mystic-gold"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-mystic-gold"></div>
      </div>

      {/* 头部 */}
      <div className="z-20 text-center mb-4 mt-2">
        <h1 className="text-mystic-gold text-xl tracking-[0.3em] uppercase font-bold mb-2">Ether Tarot</h1>
        <div className="h-[1px] w-12 bg-mystic-gold/50 mx-auto"></div>
        <p className="text-[10px] text-neutral-500 mt-2 tracking-widest uppercase">
            {spreadConfig.name}
        </p>
      </div>

      {/* 问题区 - 根据牌阵类型动态展示 */}
      {spreadConfig.id === 'choice-guidance' && choices ? (
        <div className="z-20 w-full max-w-[320px] bg-white/5 border border-white/10 px-4 py-3 rounded-lg mb-4 backdrop-blur-sm flex flex-col justify-center items-center gap-2">
            <div className="flex w-full justify-between items-center gap-2">
                <div className="flex-1 text-center border-r border-white/10 pr-2">
                    <p className="text-neutral-500 text-[8px] uppercase tracking-widest mb-1">Option A</p>
                    <p className="text-white text-[10px] font-serif leading-tight">{truncateText(choices.optionA, 20)}</p>
                </div>
                <div className="flex-1 text-center pl-2">
                    <p className="text-neutral-500 text-[8px] uppercase tracking-widest mb-1">Option B</p>
                    <p className="text-white text-[10px] font-serif leading-tight">{truncateText(choices.optionB, 20)}</p>
                </div>
            </div>
        </div>
      ) : (
        spreadConfig.id !== 'daily-guidance' && (
            <div className="z-20 w-full max-w-[320px] bg-white/5 border border-white/10 px-4 py-3 rounded-lg mb-4 backdrop-blur-sm flex flex-col justify-center items-center">
                <p className="text-center text-neutral-400 text-[10px] mb-2 uppercase tracking-widest">The Question</p>
                <p className="text-center text-white text-xs font-serif italic leading-relaxed px-1 opacity-90">
                "{truncateText(question, 80)}"
                </p>
            </div>
        )
      )}

      {/* 牌阵展示 - 使用 Flex Wrap 代替 Grid */}
      <div className="z-20 w-full flex flex-wrap justify-center gap-3 mb-4 px-1">
         {cards.map((item, index) => (
            <div key={index} className={`flex flex-col items-center relative group ${cardWidthClass}`}>
                <div className="relative w-full aspect-[2/3] rounded border border-white/20 mb-2 shadow-lg bg-black/50">
                   <img 
                     src={item.card.image_url} 
                     className={`w-full h-full object-cover ${item.isReversed ? 'rotate-180' : ''}`}
                     crossOrigin="anonymous" 
                   />
                   {/* 这里不再显示 REV 遮罩，保持清爽 */}
                </div>
                <span className="text-[10px] text-mystic-gold font-bold text-center leading-tight h-6 flex items-center justify-center w-full overflow-hidden text-ellipsis px-1">
                    {item.card.name_cn}
                </span>
                <span className="text-[8px] text-neutral-500 uppercase tracking-wider text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">
                   {spreadConfig.positionNames[index] || `Card ${index + 1}`}
                </span>
            </div>
         ))}
      </div>

      {/* 解读摘要 */}
      <div className="z-20 w-full mb-3 flex-1 flex flex-col items-center">
        <div className="text-center mb-4 w-full">
           <h3 className="text-mystic-gold text-lg font-serif mb-3 px-3 leading-relaxed border-y border-mystic-gold/10 py-3">
             {result.summary}
           </h3>
           <div className="flex justify-center gap-2 flex-wrap px-3">
             {result.keywords.slice(0, 3).map((kw, i) => (
               <span
                 key={i}
                 className="inline-flex pt-[1px] pb-[7px] px-3 min-w-[60px] border border-white/20 rounded-full text-[10px] text-neutral-300 tracking-widest uppercase items-center justify-center leading-none"
               >
                 {kw}
               </span>
             ))}
           </div>
        </div>

        {/* 指引区域 */}
        <div className="w-full bg-gradient-to-b from-mystic-gold/5 to-transparent p-3 rounded border-t border-mystic-gold/20">
           <div className="flex items-center justify-center gap-2 mb-2 opacity-60">
              <span className="w-1 h-1 rounded-full bg-mystic-gold"></span>
              <span className="text-[10px] text-mystic-gold uppercase tracking-[0.2em]">Guidance</span>
              <span className="w-1 h-1 rounded-full bg-mystic-gold"></span>
           </div>
           <p className="text-neutral-300 text-xs leading-loose text-left font-light italic opacity-90">
             {truncateText(result.advice, 100)}
           </p>
        </div>
      </div>

      {/* 底部 */}
      <div className="z-20 w-full flex justify-between items-end mt-auto pt-3 pb-3 border-t border-white/10">
        <div className="flex flex-col">
          <span className="text-[8px] text-neutral-500 uppercase tracking-wider">Date</span>
          <span className="text-[10px] text-neutral-300 font-mono">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex flex-col items-end">
           {/* 移除 Scan to Reveal */}
           <span className="text-[10px] text-mystic-gold tracking-wider font-serif">ether-tarot.com</span>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
