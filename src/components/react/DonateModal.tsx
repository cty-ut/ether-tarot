import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 当弹窗打开时，禁止背景滚动
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  // 使用 createPortal 将弹窗渲染到 body 节点，避免受父元素 transform 影响
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }} // x: -50% 配合 left-1/2 实现水平居中
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }} // y: -50% 配合 top-1/2 实现垂直居中
            exit={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
            className="fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-[#1a1a1a] border border-mystic-gold/30 rounded-xl p-6 z-[101] shadow-2xl flex flex-col items-center origin-center"
          >
             {/* Close Button */}
             <button 
               onClick={onClose}
               className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>

             <h3 className="text-mystic-gold text-xl font-serif tracking-widest mb-2">随喜结缘</h3>
             <p className="text-neutral-400 text-xs text-center mb-6 leading-relaxed">
               若您觉得刚才的指引对您有启发，<br/>
               请完成一次‘能量交换’，<br/>
               让这份好运更稳固。
             </p>

             {/* QR Codes Container */}
             <div className="flex justify-center gap-6 mb-6 w-full">
                 {/* 微信支付 */}
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-inner overflow-hidden">
                        {/* 用户需要替换这里的图片路径 */}
                        <img 
                            src="/donate/wechat.JPG" 
                            alt="WeChat Pay" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                // 如果图片加载失败，显示占位符
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-black/50 text-xs text-center">请上传收款码至<br/>/public/donate/<br/>wechat.JPG</div>';
                            }} 
                        />
                    </div>
                    <div className="flex items-center gap-1 text-green-500/80">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8.86 2.04c-4.92 0-8.91 3.24-8.91 7.23 0 2.23 1.24 4.22 3.19 5.6-.14.72-.5 2.55-.58 2.93-.06.28.1.28.23.2.3-.19 1.86-1.24 2.6-1.72.22-.14 2.46.58 3.47.58 4.92 0 8.91-3.24 8.91-7.23.01-3.99-3.98-7.23-8.91-7.23zM19.7 9.26c-1.26-.8-2.96-1.29-4.82-1.29-4.44 0-8.03 2.8-8.03 6.25 0 .35.05.68.12 1.01 4.44-.39 8.12-3.11 8.12-6.39.01.13.25.27.47.35.65.22 2.11 1.13 2.39 1.29.11.06.25.07.19-.16-.06-.3-.32-1.64-.43-2.16 1.32-1.03 2.15-2.46 2.15-4.01 0-2.82-2.55-5.13-5.85-5.13-3.6 0-6.56 2.7-6.56 5.97 0 1.4.56 2.69 1.49 3.69 2.05.47 4.21.77 6.5.77 1.39 0 3.87-.38 4.26-.51.28-.09.63.15.63.45 0 1.62-2.1 3.31-4.98 4.18.55.1.98.12 1.4.12 4.02 0 7.29-2.66 7.29-5.93 0-2.7-2.23-4.98-5.34-5.3z"/></svg>
                        <span className="text-[10px] uppercase tracking-wider">WeChat Pay</span>
                    </div>
                 </div>
             </div>

             <p className="text-neutral-600 text-[10px] italic text-center">
                * 此为自愿赞赏，纯属对开发者的鼓励
             </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
