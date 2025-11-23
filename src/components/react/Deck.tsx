import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tarotDeck, type TarotCard } from '../../utils/tarotData';
import { Card } from './Card';
import { getTarotReading, type ReadingResult } from '../../utils/aiClient';
import { ReadingBox } from './ReadingBox';

// 扇形布局参数
const FAN_COUNT = 22; // 显示多少张牌供选择
const FAN_ANGLE = 90; // 扇形总角度
const RADIUS = 400; // 扇形半径

// 简单的洗牌算法 (Fisher-Yates Shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const Deck: React.FC = () => {
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCard; isReversed: boolean; isRevealed: boolean }[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // 流程状态: input -> shuffling -> drawing -> reading -> done
  const [step, setStep] = useState<'input' | 'shuffling' | 'drawing' | 'reading' | 'done'>('input');
  
  const [question, setQuestion] = useState('');
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // 扇形牌组的状态，存储每张牌的唯一ID
  const [fanCards, setFanCards] = useState<number[]>([]);

  // 初始化牌堆
  useEffect(() => {
    setDeck(tarotDeck);
  }, []);

  // 进入抽牌阶段时，初始化扇形牌组
  useEffect(() => {
    if (step === 'drawing') {
        setFanCards(Array.from({ length: FAN_COUNT }, (_, i) => i));
    }
  }, [step]);

  // 提交问题并开始洗牌
  const handleStart = () => {
    if (!question.trim()) return;
    setStep('shuffling');
    setIsShuffling(true);
    
    // 模拟洗牌动画
    setTimeout(() => {
      // 1. 停止洗牌动画，牌收回中心
      setIsShuffling(false);
      
      // 2. 立即进入抽牌阶段
      setTimeout(() => {
        setDeck(prev => shuffleArray(prev));
        setStep('drawing');
      }, 0);
    }, 2500);
  };

  // 抽牌逻辑 (从扇形中点击某张牌)
  const handleDraw = (fanCardId?: number) => {
    if (drawnCards.length >= 3) return;
    
    // 如果是从扇形点击的，移除该牌
    if (typeof fanCardId === 'number') {
        setFanCards(prev => prev.filter(id => id !== fanCardId));
    }

    const randomIndex = Math.floor(Math.random() * deck.length);
    const selectedCard = deck[randomIndex];
    const isReversed = Math.random() > 0.5; 

    const newDeck = [...deck];
    newDeck.splice(randomIndex, 1);
    setDeck(newDeck);

    const newDrawn = [...drawnCards, { card: selectedCard, isReversed, isRevealed: false }];
    setDrawnCards(newDrawn);
    
    // 抽满3张后进入解读阶段
    if (newDrawn.length === 3) {
        // 延迟一点时间，让最后一次抽牌动画播完
        setTimeout(() => {
            setStep('reading');
        }, 500);
    }
  };

  // 翻牌逻辑
  const handleReveal = async (index: number) => {
    const newCards = [...drawnCards];
    // 如果已经翻开了，就不重复操作
    if (newCards[index].isRevealed) return;

    newCards[index].isRevealed = true;
    setDrawnCards(newCards);

    // 检查是否所有牌都已翻开
    if (newCards.every(c => c.isRevealed)) {
        // 延迟一点时间再进入 done 状态，让用户看清最后一张牌
        setTimeout(async () => {
            setStep('done');
            await fetchReading(newCards);
        }, 1000); // 1秒延迟
    }
  };

  // 调用 AI
  const fetchReading = async (cards: { card: TarotCard; isReversed: boolean }[]) => {
      setIsAiLoading(true);
      try {
          const result = await getTarotReading(question, cards);
          setReadingResult(result);
      } catch (error) {
          console.error("AI Error", error);
      } finally {
          setIsAiLoading(false);
      }
  };

  // 自动滚动到底部当结果出来时
  useEffect(() => {
    if (readingResult) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [readingResult]);

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-100px)] relative px-4 overflow-hidden">
      
      {/* Step 1: 输入问题 (全屏居中) */}
      {step === 'input' && (
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full max-w-md space-y-8 z-20"
            >
                <h2 className="text-mystic-gold text-xl font-serif tracking-widest">你心中的疑惑是...</h2>
                <div className="w-full relative">
                    <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="请详细描述你的困惑与处境"
                        rows={4}
                        maxLength={200}
                        className="w-full bg-transparent border border-mystic-gold/30 rounded-lg p-4 text-center text-white placeholder-white/20 focus:outline-none focus:border-mystic-gold transition-colors font-light resize-none leading-relaxed"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleStart();
                            }
                        }}
                    />
                    <div className="absolute bottom-2 right-3 text-[10px] text-mystic-gold/40">
                        {question.length}/100
                    </div>
                </div>
                <button 
                    onClick={handleStart}
                    disabled={!question.trim()}
                    className="px-8 py-3 bg-mystic-gold/10 border border-mystic-gold/50 text-mystic-gold rounded-full hover:bg-mystic-gold hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 uppercase tracking-[0.2em] text-sm"
                >
                    开始仪式
                </button>
            </motion.div>
          </div>
      )}

      {/* 状态提示 (顶部固定) */}
      {step !== 'input' && (
        <div className="w-full h-12 flex items-center justify-center shrink-0 z-20">
            <div className="text-mystic-gold/60 text-xs tracking-[0.2em] uppercase">
                {step === 'shuffling' && "命运洗牌中..."}
                {step === 'drawing' && `凭直觉抽取 ${3 - drawnCards.length} 张牌`}
                {step === 'reading' && "点击翻开牌面"}
                {step === 'done' && "解读中..."}
            </div>
        </div>
      )}

      {/* 主交互区域：包含牌堆和卡槽 */}
      {step !== 'input' && step !== 'done' && (
         <div className="flex-1 w-full flex flex-col items-center justify-evenly relative">
            
            {/* 牌堆区域 (洗牌时) */}
            {step === 'shuffling' && (
                <motion.div 
                    className="relative w-64 h-48 md:h-64 flex items-center justify-center shrink-0" 
                >
                    <AnimatePresence>
                    {deck.slice(0, 12).map((card, index) => {
                        // 计算每张牌在圆环上的目标位置
                        const angle = (index / 12) * 2 * Math.PI; // 弧度
                        const radius = 140; // 展开半径
                        const xTarget = Math.cos(angle) * radius;
                        const yTarget = Math.sin(angle) * radius;
                        
                        return (
                        <motion.div
                        key={card.id}
                        className="absolute"
                        initial={{ x: 0, y: 0, rotate: 0, opacity: 0.8 }}
                        animate={isShuffling ? {
                            // 单次有层次的洗牌：每张牌飞向不同方向再收回
                            x: [0, Math.cos(index) * 150, 0], // 利用 index 制造伪随机但固定的方向
                            y: [0, Math.sin(index) * 150, 0],
                            rotate: [0, 180, 360], // 旋转一圈
                            scale: [1, 1.2, 1],
                        } : {
                            x: 0, y: 0, rotate: 0, scale: 1
                        }}
                        transition={isShuffling ? { 
                            duration: 1.2, 
                            ease: "easeInOut",
                            delay: index * 0.08, // 洗牌时：错开时间
                        } : {
                            duration: 0.3, // 归位时：极速统一
                            ease: "backOut",
                            rotate: { duration: 0 }, // 关键：归位时旋转不播动画，直接归零，消除视觉上的转圈
                            delay: 0 
                        }}
                        >
                            {/* 牌背 - 使用自定义图片 */}
                            <div className="w-20 h-32 md:w-24 md:h-40 rounded-lg bg-[#1a1a1a] border border-neutral-700 shadow-2xl overflow-hidden relative">
                                <img 
                                    src="/patterns/Cardback.png" 
                                    alt="Card Back" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>
                    )})}
                    </AnimatePresence>
                </motion.div>
            )}

             {/* 牌堆区域 (抽牌时 - 扇形展开) */}
             <AnimatePresence>
             {step === 'drawing' && (
                <motion.div 
                    key="fan-deck-container"
                    className="relative w-full h-48 md:h-64 flex items-center justify-center shrink-0 overflow-visible" 
                    initial={{ opacity: 1 }} // 容器不动，让里面的牌动
                    animate={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0, 
                        y: -50, // 向上飘走
                        scale: 0.9, // 稍微变小
                        filter: "blur(10px)", // 增加模糊感，像梦境消散
                        transition: { duration: 0.8, ease: "easeInOut" } 
                    }}
                >
                    <div className="absolute top-10 md:top-20 transform origin-bottom" style={{ height: RADIUS, width: 0 }}>
                        <AnimatePresence>
                        {fanCards.map((cardId, index) => {
                            // 基于当前剩余数量动态计算角度，实现自动补位
                            const currentCount = fanCards.length;
                            // 保持总扇形角度不变，但随着牌变少，间距变大？
                            // 或者保持间距不变，扇形变小？
                            // 这里选择：保持总扇形角度大致不变（微调），让牌重新均匀分布
                            const centerIndex = (currentCount - 1) / 2;
                            // 随着牌减少，角度稍微收缩一点，避免太稀疏
                            const dynamicFanAngle = Math.min(FAN_ANGLE, currentCount * 5); 
                            const anglePerCard = dynamicFanAngle / (currentCount - 1 || 1);
                            const rotation = (index - centerIndex) * anglePerCard;
                            
                            // 使用绝对坐标计算代替 transformOrigin，防止 layout 动画出错
                            const rad = rotation * (Math.PI / 180);
                            const x = Math.sin(rad) * RADIUS;
                            const y = RADIUS - Math.cos(rad) * RADIUS;

                            return (
                                <motion.div
                                    key={cardId}
                                    layout // 开启自动布局动画 (补位核心)
                                    className="absolute top-0 left-0 w-12 h-20 md:w-16 md:h-24 -ml-6 md:-ml-8 origin-bottom cursor-pointer"
                                    initial={{ opacity: 0, scale: 0.8, x, y, rotate: rotation }}
                                    animate={{ opacity: 1, scale: 1, x, y, rotate: rotation }}
                                    exit={{ 
                                        y: y + 200, // 这里的 y 是相对当前位置再向下
                                        opacity: 0, 
                                        scale: 0.5,
                                        transition: { duration: 0.5 } 
                                    }}
                                    transition={{ 
                                        layout: { duration: 0.3, ease: "easeInOut" }, // 补位动画
                                        opacity: { duration: 0.4, delay: index * 0.02 },
                                        scale: { duration: 0.4, delay: index * 0.02 }
                                    }}
                                    whileHover={{ scale: 1.1, zIndex: 10 }} // 悬停时只放大，不改变 y，防止计算冲突
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDraw(cardId)}
                                >
                                     <div className="w-full h-full rounded bg-[#1a1a1a] border border-neutral-700 shadow-lg overflow-hidden relative">
                                        <img 
                                            src="/patterns/Cardback.png" 
                                            alt="Card Back" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* 已抽取的牌 (卡槽) */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-8 w-full max-w-4xl min-h-[160px] items-start z-10">
                <AnimatePresence>
                    {drawnCards.map((item, index) => (
                    <motion.div
                        key={`${item.card.id}-${index}`}
                        initial={{ 
                            opacity: 0, 
                            y: -400, // 更高的位置，模拟从扇形中心飞出
                            scale: 0.5, // 初始很小
                            rotate: 180 // 初始是倒着的或者旋转的
                        }} 
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            x: 0,
                            scale: 1,
                            rotate: 0 
                        }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 200, // 稍微减小刚度，让它飞得慢一点
                            damping: 20 
                        }}
                        className="flex flex-col items-center"
                    >
                        <Card 
                            card={item.card} 
                            isReversed={item.isReversed} 
                            isRevealed={item.isRevealed}
                            onClick={() => (step === 'reading' || step === 'done') && handleReveal(index)}
                            className={step === 'drawing' ? 'cursor-default scale-90 md:scale-100' : 'cursor-pointer scale-90 md:scale-100'} 
                        />
                        {/* 牌名提示 */}
                        <motion.div 
                            className="mt-2 md:mt-4 text-center h-10 flex flex-col items-center justify-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: item.isRevealed ? 1 : 0 }}
                        >
                            <h3 className="text-white text-xs font-bold mb-1">
                                {item.card.name_cn} {item.isReversed && <span className="text-red-400 text-[10px]">(逆位)</span>}
                            </h3>
                            <p className="text-mystic-gold/60 text-[10px] uppercase tracking-widest whitespace-nowrap">
                                {index === 0 ? '过去/现状' : index === 1 ? '现在/挑战' : '未来/建议'}
                            </p>
                        </motion.div>
                    </motion.div>
                    ))}
                </AnimatePresence>
                
                {/* 占位符：当还没有抽牌时，保持布局稳定 (可选) */}
                {drawnCards.length === 0 && step === 'drawing' && (
                    <div className="w-full text-center text-white/20 text-sm italic mt-8">
                        请从上方扇形牌阵中，凭直觉抽取一张
                    </div>
                )}
            </div>
         </div>
      )}

      {/* 结果展示阶段：重新布局，牌在顶上，结果在下面 */}
      {step === 'done' && (
          <div className="w-full flex flex-col items-center mt-8">
             <div className="flex flex-wrap justify-center gap-3 md:gap-8 w-full max-w-4xl mb-8">
                 {drawnCards.map((item, index) => (
                    <div key={index} className="flex flex-col items-center scale-90 md:scale-100">
                        <Card 
                            card={item.card} 
                            isReversed={item.isReversed} 
                            isRevealed={true}
                            className="cursor-default"
                        />
                        <div className="mt-3 text-center">
                            <h3 className="text-white text-xs font-bold mb-1">
                                {item.card.name_cn} {item.isReversed && <span className="text-red-400 text-[10px]">(逆位)</span>}
                            </h3>
                            <p className="text-mystic-gold/60 text-[10px] uppercase tracking-widest">
                                {index === 0 ? '过去' : index === 1 ? '现在' : '未来'}
                            </p>
                        </div>
                    </div>
                 ))}
             </div>
             <ReadingBox result={readingResult} isLoading={isAiLoading} />
          </div>
      )}

    </div>
  );
};
