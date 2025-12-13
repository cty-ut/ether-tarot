import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');

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

             {/* QR Codes Container - 使用 Tab 切换 */}
             <div className="w-full mb-6">
                 {/* Tabs */}
                 <div className="flex w-full mb-4 border-b border-white/10">
                     <button 
                        onClick={() => setActiveTab('wechat')}
                        className={`flex-1 pb-2 text-xs uppercase tracking-widest transition-colors ${
                            activeTab === 'wechat' ? 'text-green-500 border-b border-green-500' : 'text-neutral-500'
                        }`}
                     >
                         微信 WeChat
                     </button>
                     <button 
                        onClick={() => setActiveTab('alipay')}
                        className={`flex-1 pb-2 text-xs uppercase tracking-widest transition-colors ${
                            activeTab === 'alipay' ? 'text-blue-500 border-b border-blue-500' : 'text-neutral-500'
                        }`}
                     >
                         支付宝 Alipay
                     </button>
                 </div>

                 {/* Content */}
                 <div className="flex justify-center">
                    <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-inner overflow-hidden relative">
                        {/* 微信码 */}
                        <div className={`absolute inset-2 transition-opacity duration-300 ${activeTab === 'wechat' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <img 
                                src="/donate/wechat.JPG" 
                                alt="WeChat Pay" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-black/50 text-xs text-center">请上传微信收款码<br/><span class="font-mono text-[8px]">/public/donate/wechat.JPG</span></div>';
                                }} 
                            />
                        </div>
                        
                        {/* 支付宝码 */}
                        <div className={`absolute inset-2 transition-opacity duration-300 ${activeTab === 'alipay' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                            <img 
                                src="/donate/alipay.JPG" 
                                alt="Alipay" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-black/50 text-xs text-center">请上传支付宝收款码<br/><span class="font-mono text-[8px]">/public/donate/alipay.JPG</span></div>';
                                }} 
                            />
                        </div>
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
