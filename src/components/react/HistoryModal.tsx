import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HistoryRecord } from '../../utils/historyManager';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
  onRetryRecord: (record: HistoryRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onRetryRecord
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-[#cfb53b]/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <h2 className="text-xl font-serif font-bold text-[#cfb53b]">历史记录</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无历史记录</p>
                </div>
              ) : (
                history.map((record) => (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      record.isError 
                        ? 'bg-red-900/10 border-red-500/30 hover:bg-red-900/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400 font-mono">{record.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        !record.result 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : record.isError 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-[#cfb53b]/20 text-[#cfb53b]'
                      }`}>
                        {!record.result ? '等待解读...' : (record.isError ? '连接失败' : '解读完成')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-200 mb-3 line-clamp-2">
                      {record.question || "无具体问题"}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {record.cards.slice(0, 3).map((c, i) => (
                           <div key={i} className="w-6 h-8 rounded bg-gray-800 border border-white/20 overflow-hidden relative shadow-sm">
                             <img src={c.card.image_url} className="w-full h-full object-cover opacity-80" />
                           </div>
                        ))}
                        {record.cards.length > 3 && (
                            <div className="w-6 h-8 rounded bg-gray-800 border border-white/20 flex items-center justify-center text-[8px] text-gray-400">
                                +{record.cards.length - 3}
                            </div>
                        )}
                      </div>
                      
                      {/* 如果没有结果(比如刷新页面中断了)，或者明确报错，都显示重试按钮 */}
                      {!record.result || record.isError ? (
                        <button
                          onClick={() => onRetryRecord(record)}
                          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs rounded transition-colors flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                          {!record.result ? '继续生成' : '重新发送'}
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="px-3 py-1.5 border border-[#cfb53b]/50 text-[#cfb53b] hover:bg-[#cfb53b]/10 text-xs rounded transition-colors"
                        >
                          查看解读
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 text-center text-[10px] text-gray-500 bg-black/40">
                仅保留最近 5 条记录
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
