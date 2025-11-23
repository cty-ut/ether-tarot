import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TarotCard } from '../../utils/tarotData';

interface CardProps {
  card: TarotCard;
  isReversed: boolean;
  isRevealed: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  card,
  isReversed,
  isRevealed,
  onClick,
  className,
  style
}) => {
  return (
    <div
      className={twMerge("relative w-24 h-40 cursor-pointer perspective-1000", className)}
      onClick={onClick}
      style={style}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-700"
        initial={false}
        animate={{ 
            rotateY: isRevealed ? 180 : 0,
            rotateZ: isRevealed && isReversed ? 180 : 0 // 逆位时旋转 180 度
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Card Back (牌背) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg overflow-hidden border-2 border-mystic-gold/30 bg-[#1a1a1a]">
          <img 
            src="/patterns/Cardback.png" 
            alt="Card Back" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Card Front (牌面) */}
        <div 
          className={clsx(
            "absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-xl overflow-hidden bg-black border-2 border-mystic-gold",
            "rotate-y-180" 
          )}
        >
          <div className="w-full h-full relative">
            {/* 真实图片 */}
            <img 
                src={card.image_url} 
                alt={card.name_cn} 
                className="w-full h-full object-cover"
                onError={(e) => {
                    // 图片加载失败时，隐藏图片，显示下面的文字兜底
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) {
                        fallback.classList.remove('hidden');
                        fallback.classList.add('flex');
                    }
                }}
            />
            
            {/* 文字兜底 (默认隐藏，加载失败才显示) */}
            <div className={clsx(
                "hidden w-full h-full flex-col items-center justify-center bg-gray-900 p-2 text-center absolute inset-0",
                isReversed && "rotate-180" // 只有文字兜底时，才需要把文字正过来
            )}>
                <span className="text-mystic-gold text-xs font-bold uppercase tracking-widest mb-2">{card.suit}</span>
                <h3 className="text-white font-serif text-sm">{card.name_cn}</h3>
                <p className="text-gray-500 text-[10px] mt-1">{card.name_en}</p>
                {isReversed && <span className="text-red-400 text-[10px] mt-2 font-bold tracking-wider">(逆位)</span>}
            </div>
          </div>
          
          {/* 闪光特效 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
        </div>
      </motion.div>
    </div>
  );
};
