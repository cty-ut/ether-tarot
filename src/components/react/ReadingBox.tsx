import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { ReadingResult } from '../../utils/aiClient';

interface ReadingBoxProps {
  result: ReadingResult | null;
  isLoading: boolean;
}

export const ReadingBox: React.FC<ReadingBoxProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mt-8 text-center space-y-4"
      >
        <div className="inline-block w-12 h-12 border-4 border-mystic-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-mystic-gold/60 text-sm tracking-widest animate-pulse">
          星象正在汇聚...
        </p>
      </motion.div>
    );
  }

  if (!result) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-2xl mt-12 p-8 bg-neutral-900/80 backdrop-blur-md border border-mystic-gold/30 rounded-xl shadow-2xl relative"
    >
      {/* 装饰性边角 */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-mystic-gold"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-mystic-gold"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-mystic-gold"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-mystic-gold"></div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-serif text-mystic-gold mb-2 leading-relaxed">{result.summary}</h2>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          {result.keywords.map((kw, i) => (
            <span key={i} className="px-3 py-1 text-[10px] uppercase tracking-wider border border-mystic-gold/20 rounded-full text-neutral-400">
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="text-neutral-300 font-light leading-relaxed text-justify prose prose-invert prose-p:mb-4 prose-strong:text-mystic-gold prose-strong:font-bold">
        <ReactMarkdown>
            {result.detailed_interpretation}
        </ReactMarkdown>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-mystic-gold text-xs uppercase tracking-widest mb-2">指引</h3>
        <p className="text-white italic">{result.advice}</p>
      </div>
    </motion.div>
  );
};
