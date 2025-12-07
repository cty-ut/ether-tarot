import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (3 days)
    const dismissedAt = localStorage.getItem('installPromptDismissedAt');
    if (dismissedAt) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 3) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Handle Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not dismissed recently (checked above)
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we might want to show it after a small delay to not annoy immediately
    if (isIosDevice) {
        // Only show if not dismissed recently
         setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissedAt', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-4 right-4 z-50 p-5 bg-[#0a0a0a]/95 border border-[#cfb53b]/30 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md"
        >
          {/* 金色光晕装饰 */}
          <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[inset_0_0_20px_rgba(207,181,59,0.05)]" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#cfb53b] mb-2 font-serif tracking-wide">开启以太塔罗</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                将应用添加到主屏幕，获得更沉浸的体验。
              </p>
              
              {isIOS ? (
                <div className="text-sm text-gray-300 bg-black/40 border border-[#cfb53b]/10 p-3 rounded-lg space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#cfb53b]/10 text-[#cfb53b] text-xs">1</span>
                    点击浏览器底部的分享按钮 <span className="text-lg text-[#cfb53b]">⎋</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#cfb53b]/10 text-[#cfb53b] text-xs">2</span>
                    选择"添加到主屏幕"
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="px-5 py-2.5 bg-[#cfb53b] hover:bg-[#eac442] text-[#050505] rounded-lg font-bold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(207,181,59,0.2)] hover:shadow-[0_0_20px_rgba(207,181,59,0.4)]"
                >
                  添加到主屏幕
                </button>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="ml-4 -mr-1 p-2 text-gray-500 hover:text-[#cfb53b] transition-colors"
              aria-label="关闭"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
