import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tarotDeck, spreads, type TarotCard, type SpreadConfig } from '../../utils/tarotData';
import { Card } from './Card';
import { getTarotReading, type ReadingResult } from '../../utils/aiClient';
import { ReadingBox } from './ReadingBox';
import { DonateModal } from './DonateModal';
import { HistoryManager, type HistoryRecord } from '../../utils/historyManager';
import { HistoryModal } from './HistoryModal';

// 扇形布局参数
const FAN_COUNT = 22; // 显示多少张牌供选择
const FAN_ANGLE = 90; // 扇形总角度
const RADIUS = 400; // 扇形半径
const DAILY_READING_KEY = 'ether_tarot_last_daily';

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
  
  // 新增：牌阵选择状态，默认为时间流（3张牌）
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfig>(spreads[1]);
  
  // 流程状态: selection -> input -> shuffling -> drawing -> reading -> done
  const [step, setStep] = useState<'selection' | 'input' | 'shuffling' | 'drawing' | 'reading' | 'done'>('selection');
  
  const [question, setQuestion] = useState('');
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // 二选一输入状态
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [contextInfo, setContextInfo] = useState('');

  // 每日一牌限制状态
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);

  // 赞赏弹窗状态 (Deck 级别的)
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  // 历史记录状态
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // 扇形牌组的状态，存储每张牌的唯一ID
  const [fanCards, setFanCards] = useState<number[]>([]);

  // 预加载图片帮助函数
  const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
  };

  // 检查每日一牌限制 (Helper)
  const checkDailyLimit = (): boolean => {
    const lastDate = localStorage.getItem(DAILY_READING_KEY);
    const today = new Date().toDateString();
    return lastDate === today;
  };

  // 初始化牌堆 & 预加载资源 & 检查限制
  useEffect(() => {
    setDeck(tarotDeck);
    // 强制预加载卡背图，防止首次洗牌卡顿
    preloadImage('/patterns/Cardback.png');
    // 初始化检查限制
    setIsDailyLimitReached(checkDailyLimit());
    // 加载历史记录
    setHistory(HistoryManager.getHistory());
  }, []);

  // 进入抽牌阶段时，初始化扇形牌组
  useEffect(() => {
    if (step === 'drawing') {
        setFanCards(Array.from({ length: FAN_COUNT }, (_, i) => i));
    }
  }, [step]);


  // 记录完成每日一牌
  const markDailyCompleted = () => {
    localStorage.setItem(DAILY_READING_KEY, new Date().toDateString());
    setIsDailyLimitReached(true); // 立即更新 UI
  };

  // 处理牌阵选择
  const handleSelectSpread = (spread: SpreadConfig) => {
    if (spread.id === 'daily-guidance') {
        // 检查限制 (双重保障)
        if (isDailyLimitReached || checkDailyLimit()) {
            return; // 直接忽略点击
        }

        setSelectedSpread(spread);
        setQuestion("今日指引"); 
        triggerStart("今日指引");
    } else {
        setSelectedSpread(spread);
        setStep('input');
        
        // 重置所有输入
        setQuestion(''); 
        setOptionA('');
        setOptionB('');
        setContextInfo('');
    }
  };

  // 抽离开始逻辑，接受可选的 questionOverride
  const triggerStart = (overrideQuestion?: string) => {
    // 构造最终问题字符串
    let finalQuestion = overrideQuestion || question;

    // 如果是二选一，拼接问题
    if (!overrideQuestion && selectedSpread.id === 'choice-guidance') {
        if (!optionA.trim() || !optionB.trim()) return; // 简单校验
        finalQuestion = `CHOICE_A:${optionA.trim()}|CHOICE_B:${optionB.trim()}|CONTEXT:${contextInfo.trim()}`;
    }

    if (!finalQuestion.trim()) return;
    
    // 如果是每日一牌，在这里记录使用情况
    if (overrideQuestion === "今日指引") {
        markDailyCompleted();
    }

    // 确保 question state 也更新 (虽然可能已经被 setOption 覆盖了，但这里是最终提交给 API 的 string)
    setQuestion(finalQuestion);

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

  // 提交问题并开始洗牌 (给按钮用的)
  const handleStart = () => triggerStart();

  // 抽牌逻辑 (从扇形中点击某张牌)
  const handleDraw = (fanCardId?: number) => {
    // 使用选定牌阵的卡牌数量
    if (drawnCards.length >= selectedSpread.cardCount) return;
    
    // 如果是从扇形点击的，移除该牌
    if (typeof fanCardId === 'number') {
        setFanCards(prev => prev.filter(id => id !== fanCardId));
    }

    const randomIndex = Math.floor(Math.random() * deck.length);
    const selectedCard = deck[randomIndex];
    // 调整逆位概率：只有 20% 的概率是逆位 (random < 0.2)
    const isReversed = Math.random() < 0.2; 

    const newDeck = [...deck];
    newDeck.splice(randomIndex, 1);
    setDeck(newDeck);

    // 【性能优化】一旦抽中，立即在后台预加载这张牌的正面大图
    preloadImage(selectedCard.image_url);

    const newDrawn = [...drawnCards, { card: selectedCard, isReversed, isRevealed: false }];
    setDrawnCards(newDrawn);
    
    // 抽满后进入解读阶段
    if (newDrawn.length === selectedSpread.cardCount) {
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
        setTimeout(async () => {
            setStep('done');
            await fetchReading(newCards);
        }, 1700); 
    }
  };

  // 调用 AI
  const fetchReading = async (cards: { card: TarotCard; isReversed: boolean }[], retryRecordId?: number) => {
      setIsAiLoading(true);
      
      let currentRecordId = retryRecordId;

      // 如果不是重试，说明是新的抽牌，立即保存一个"待处理"的记录
      if (!currentRecordId) {
          currentRecordId = HistoryManager.saveHistory({
              spreadId: selectedSpread.id,
              cards: cards,
              question: question,
              result: null, // 先存为空
              isError: false
          });
          // 立即更新UI显示
          setHistory(HistoryManager.getHistory());
      }

      try {
          // 传递牌阵 ID，让后端选择对应的 Prompt 策略
          const result = await getTarotReading(question, cards, selectedSpread.id);
          setReadingResult(result);
          
          const isError = result.summary === "连接被干扰";
          
          if (currentRecordId) {
              // 请求完成后，更新这条记录
              HistoryManager.updateRecord(currentRecordId, result, isError);
          }
          // 更新本地状态中的历史记录
          setHistory(HistoryManager.getHistory());
          
      } catch (error) {
          console.error("AI Error", error);
          if (currentRecordId) {
             // 如果是代码层面的严重错误，也可以标记为 Error
             // 但通常 getTarotReading 内部 catch 后会返回 "连接被干扰" 的结果，所以这里可能走不到
             // 不过为了保险起见，可以在这里也更新一下
          }
      } finally {
          setIsAiLoading(false);
      }
  };

  // 处理历史记录操作
  const handleSelectRecord = (record: HistoryRecord) => {
      // 恢复状态以显示结果
      // 找到对应的牌阵配置
      const spread = spreads.find(s => s.id === record.spreadId) || spreads[1];
      setSelectedSpread(spread);
      
      // 恢复卡牌和问题
      // 注意：这里我们需要把 HistoryRecord 里的 cards (TarotCard & isReversed) 
      // 转换成 drawnCards 需要的格式 (加 isRevealed: true)
      const restoredCards = record.cards.map(c => ({
          ...c,
          isRevealed: true
      }));
      setDrawnCards(restoredCards);
      setQuestion(record.question);
      setReadingResult(record.result);
      
      // 关闭弹窗，进入结果页
      setIsHistoryOpen(false);
      setStep('done');
  };

  const handleRetryRecord = async (record: HistoryRecord) => {
      // 恢复状态并立即重试
      const spread = spreads.find(s => s.id === record.spreadId) || spreads[1];
      setSelectedSpread(spread);
      
      const restoredCards = record.cards.map(c => ({
          ...c,
          isRevealed: true
      }));
      setDrawnCards(restoredCards);
      setQuestion(record.question);
      
      setIsHistoryOpen(false);
      setStep('done'); // 进入结果页显示 Loading
      
      // 触发重试 API 调用
      await fetchReading(record.cards, record.id);
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
      
      {/* Step 0: 选择牌阵 */}
      {step === 'selection' && (
        <div className="flex-1 flex flex-col items-center justify-start w-full max-w-5xl z-20 space-y-4 mt-2 md:mt-4 relative">
           {/* 移动端右上角独立赞赏按钮 - 独立于标题容器，绝对定位于父容器右上角 */}
           <button 
               onClick={() => setIsDonateOpen(true)}
               className="absolute top-0 right-0 md:hidden flex items-center gap-1.5 px-3 py-1.5 border border-mystic-gold/30 rounded-full text-mystic-gold/80 hover:text-mystic-gold bg-black/20 backdrop-blur-sm z-30"
           >
               <span className="text-xs">✨</span>
               <span className="text-[10px] uppercase tracking-widest font-medium">赞赏</span>
           </button>

           {/* 移动端左上角历史记录按钮 */}
           <button 
               onClick={() => setIsHistoryOpen(true)}
               className="absolute top-0 left-0 md:hidden flex items-center gap-1.5 px-3 py-1.5 border border-mystic-gold/30 rounded-full text-mystic-gold/80 hover:text-mystic-gold bg-black/20 backdrop-blur-sm z-30"
           >
               <span className="text-xs">↺</span>
               <span className="text-[10px] uppercase tracking-widest font-medium">历史</span>
           </button>

           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center relative w-full"
           >
             <h2 className="text-mystic-gold text-2xl md:text-3xl font-serif tracking-[0.2em] mb-2">选择仪式</h2>
             <div className="h-[1px] w-16 bg-mystic-gold/50 mx-auto mb-2"></div>
             <p className="text-neutral-400 text-sm tracking-widest uppercase">Choose Your Spread</p>
             
             {/* PC端赞赏入口 - 依然在标题右侧，但位置更远 */}
             <button 
                onClick={() => setIsDonateOpen(true)}
                className="hidden md:flex absolute right-[-180px] top-1/2 -translate-y-1/2 items-center gap-2 px-3 py-1.5 border border-mystic-gold/30 rounded-full text-mystic-gold/80 hover:text-mystic-gold hover:bg-mystic-gold/10 hover:border-mystic-gold transition-all duration-300 backdrop-blur-sm z-30"
             >
                <span className="text-xs">✨</span>
                <span className="text-[10px] uppercase tracking-widest font-medium">随喜赞赏</span>
             </button>

             {/* PC端历史记录入口 - 标题左侧 */}
             <button 
                onClick={() => setIsHistoryOpen(true)}
                className="hidden md:flex absolute left-[-180px] top-1/2 -translate-y-1/2 items-center gap-2 px-3 py-1.5 border border-mystic-gold/30 rounded-full text-mystic-gold/80 hover:text-mystic-gold hover:bg-mystic-gold/10 hover:border-mystic-gold transition-all duration-300 backdrop-blur-sm z-30"
             >
                <span className="text-xs">↺</span>
                <span className="text-[10px] uppercase tracking-widest font-medium">历史记录</span>
             </button>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-4">
             {spreads.map((spread, index) => {
               // 判断是否是每日一牌且已完成
               const isDailyCompleted = spread.id === 'daily-guidance' && isDailyLimitReached;

               return (
               <motion.button
                 key={spread.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 whileHover={isDailyCompleted ? {} : { scale: 1.02, y: -5 }}
                 whileTap={isDailyCompleted ? {} : { scale: 0.98 }}
                 onClick={() => handleSelectSpread(spread)}
                 disabled={isDailyCompleted}
                 className={`flex flex-col p-6 border rounded-xl transition-all duration-300 group text-left relative overflow-hidden h-full ${
                    isDailyCompleted 
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed' 
                    : 'bg-white/5 border-mystic-gold/20 hover:bg-white/10 hover:border-mystic-gold/50'
                 }`}
               >
                 {/* 装饰线 - 只在非禁用状态下高亮 */}
                 {!isDailyCompleted && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-mystic-gold/20 group-hover:bg-mystic-gold transition-colors duration-500"></div>
                 )}
                 
                 <div className="flex justify-between items-start mb-4">
                   <h3 className={`text-xl font-serif tracking-wider transition-colors ${
                       isDailyCompleted ? 'text-neutral-500' : 'text-mystic-gold group-hover:text-white'
                   }`}>
                       {spread.name}
                   </h3>
                   <span className={`px-2 py-1 text-[10px] border rounded uppercase tracking-widest ${
                       isDailyCompleted ? 'border-neutral-600 text-neutral-600' : 'border-mystic-gold/30 text-mystic-gold/60'
                   }`}>
                     {spread.cardCount} Card{spread.cardCount > 1 ? 's' : ''}
                   </span>
                 </div>
                 
                 <p className="text-neutral-400 text-sm leading-relaxed mb-8 min-h-[40px] flex-grow">{spread.description}</p>
                 
                 <div className={`mt-auto flex items-center text-xs uppercase tracking-widest transition-colors ${
                     isDailyCompleted ? 'text-neutral-600' : 'text-mystic-gold/60 group-hover:text-mystic-gold'
                 }`}>
                   <span>
                       {spread.id === 'daily-guidance' 
                            ? (isDailyCompleted ? '明日再来' : '开始解读') 
                            : '输入问题'}
                   </span>
                   {!isDailyCompleted && <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>}
                   {isDailyCompleted && <span className="ml-2 text-lg leading-none">🔒</span>}
                 </div>
               </motion.button>
             );})}
           </div>
        </div>
      )}

      {/* Step 1: 输入问题 (全屏居中) */}
      {step === 'input' && (
          <div className="flex-1 flex items-center justify-center w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full max-w-md space-y-8 z-20"
            >
                <div className="text-center space-y-2">
                  <h2 className="text-mystic-gold text-xl font-serif tracking-widest">你心中的疑惑是...</h2>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest">当前牌阵: {selectedSpread.name}</p>
                </div>
                
                <div className="w-full relative">
                    {selectedSpread.id === 'choice-guidance' ? (
                        <div className="space-y-4 w-full">
                            {/* 二选一专用输入 */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] text-mystic-gold/60 uppercase tracking-wider">选项 A</label>
                                    <input 
                                        type="text"
                                        value={optionA}
                                        onChange={(e) => setOptionA(e.target.value)}
                                        placeholder="例如: 辞职"
                                        className="w-full bg-transparent border border-mystic-gold/30 rounded-lg p-3 text-center text-white placeholder-white/20 focus:outline-none focus:border-mystic-gold transition-colors font-light"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] text-mystic-gold/60 uppercase tracking-wider">选项 B</label>
                                    <input 
                                        type="text"
                                        value={optionB}
                                        onChange={(e) => setOptionB(e.target.value)}
                                        placeholder="例如: 留任"
                                        className="w-full bg-transparent border border-mystic-gold/30 rounded-lg p-3 text-center text-white placeholder-white/20 focus:outline-none focus:border-mystic-gold transition-colors font-light"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-mystic-gold/60 uppercase tracking-wider">背景描述 (可选)</label>
                                <textarea 
                                    value={contextInfo}
                                    onChange={(e) => setContextInfo(e.target.value)}
                                    placeholder="简述你的纠结与处境..."
                                    rows={3}
                                    maxLength={100}
                                    className="w-full bg-transparent border border-mystic-gold/30 rounded-lg p-3 text-center text-white placeholder-white/20 focus:outline-none focus:border-mystic-gold transition-colors font-light resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <textarea 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="请详细描述你的困惑与处境"
                                rows={4}
                                maxLength={100}
                                className="w-full bg-transparent border border-mystic-gold/30 rounded-lg p-4 text-center text-white placeholder-white/20 focus:outline-none focus:border-mystic-gold transition-colors font-light resize-none leading-relaxed"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleStart();
                                    }
                                }}
                            />
                            <div className={`absolute bottom-2 right-3 text-[10px] transition-colors ${question.length > 90 ? 'text-red-400' : 'text-mystic-gold/40'}`}>
                                {question.length}/100
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-4">
                  <button 
                      onClick={() => setStep('selection')}
                      className="px-6 py-3 border border-white/10 text-white/50 rounded-full hover:bg-white/5 hover:text-white transition-all duration-300 uppercase tracking-wider text-xs"
                  >
                      返回选择
                  </button>
                  <button 
                      onClick={handleStart}
                      // 二选一需要校验两个选项，普通模式校验 question
                      disabled={selectedSpread.id === 'choice-guidance' ? (!optionA.trim() || !optionB.trim()) : !question.trim()}
                      className="px-8 py-3 bg-mystic-gold/10 border border-mystic-gold/50 text-mystic-gold rounded-full hover:bg-mystic-gold hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 uppercase tracking-[0.2em] text-sm"
                  >
                      开始仪式
                  </button>
                </div>
            </motion.div>
          </div>
      )}

      {/* 状态提示 (顶部固定) - 解读完成后不显示 */}
      {step !== 'selection' && step !== 'input' && (step !== 'done' || isAiLoading) && (
        <div className="w-full h-12 flex items-center justify-center shrink-0 z-20">
            <div className="text-mystic-gold/60 text-xs tracking-[0.2em] uppercase">
                {step === 'shuffling' && "命运洗牌中..."}
                {step === 'drawing' && `凭直觉抽取 ${selectedSpread.cardCount - drawnCards.length} 张牌`}
                {step === 'reading' && "点击翻开牌面"}
                {step === 'done' && isAiLoading && "解读中..."}
            </div>
        </div>
      )}

      {/* 主交互区域：包含牌堆和卡槽 */}
      {step !== 'selection' && step !== 'input' && step !== 'done' && (
         <div className="flex-1 w-full flex flex-col items-center justify-evenly relative">
            
            {/* 牌堆区域 (洗牌时) */}
            {step === 'shuffling' && (
                <motion.div 
                    className="relative w-64 h-48 md:h-64 flex items-center justify-center shrink-0 will-change-transform" 
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
                    className="relative w-full h-48 md:h-64 flex items-center justify-center shrink-0 overflow-visible will-change-transform" 
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
                            onClick={() => step === 'reading' && handleReveal(index)}
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
                                {/* 使用牌阵配置中的位置名称 */}
                                {selectedSpread.positionNames[index] || `Card ${index + 1}`}
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
                                {/* 使用牌阵配置中的位置名称 */}
                                {selectedSpread.positionNames[index] || `Card ${index + 1}`}
                            </p>
                        </div>
                    </div>
                 ))}
             </div>
             <ReadingBox 
                result={readingResult} 
                isLoading={isAiLoading} 
                question={question}
                cards={drawnCards}
                spreadConfig={selectedSpread}
             />
          </div>
      )}

      {/* Deck 组件的赞赏弹窗 (服务于首页按钮) */}
      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />

      {/* 历史记录弹窗 */}
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelectRecord={handleSelectRecord}
        onRetryRecord={handleRetryRecord}
      />
    </div>
  );
};
