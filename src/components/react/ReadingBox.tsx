import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import type { ReadingResult } from '../../utils/aiClient';
import type { TarotCard, SpreadConfig } from '../../utils/tarotData';
import { ShareCard } from './ShareCard';
import { DonateModal } from './DonateModal';

interface ReadingBoxProps {
  result: ReadingResult | null;
  isLoading: boolean;
  question: string;
  cards: { card: TarotCard; isReversed: boolean }[];
  spreadConfig: SpreadConfig;
}

export const ReadingBox: React.FC<ReadingBoxProps> = ({ result, isLoading, question, cards, spreadConfig }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const handleGenerateImage = async () => {
    if (!shareCardRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#0a0a0a', 
      });

      const image = canvas.toDataURL('image/png');
      setPreviewImage(image);

    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("生成图片失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // 辅助函数：DataURL 转 Blob
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleShareOrSave = async () => {
    if (!previewImage) return;

    const blob = dataURLtoBlob(previewImage);
    const file = new File([blob], `EtherTarot-${new Date().toISOString().slice(0,10)}.png`, { type: 'image/png' });

    // 尝试调用原生分享 (iOS/Android)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Ether Tarot Reading',
          text: '我的塔罗牌解读',
        });
        // 分享成功视为保存成功
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        // 用户取消分享不报错
        if ((error as Error).name !== 'AbortError') {
           console.error("Share failed", error);
           // 分享失败尝试下载
           triggerDownload();
        }
      }
    } else {
      // 不支持 Share API，回退到下载
      triggerDownload();
    }
  };

  const triggerDownload = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `EtherTarot-${new Date().toISOString().slice(0,10)}.png`;
    link.click();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

      <div className="mt-10 flex flex-col items-center gap-4 w-full">
        
        {/* 新版：更有存在感的赞赏卡片 */}
        <button 
            onClick={() => setIsDonateOpen(true)}
            className="w-full relative group overflow-hidden rounded-xl border border-mystic-gold/30 bg-gradient-to-r from-mystic-gold/5 via-mystic-gold/10 to-mystic-gold/5 hover:border-mystic-gold/60 transition-all duration-500 p-4 flex flex-col items-center gap-2"
        >
            <div className="absolute inset-0 bg-mystic-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            
            <div className="flex items-center justify-center gap-3 relative z-10 w-full text-center">
                <span className="text-xl">✨</span>
                <span className="text-mystic-gold text-lg font-serif tracking-[0.2em] font-bold uppercase group-hover:text-white transition-colors whitespace-nowrap">随喜赞赏</span>
                <span className="text-xl">✨</span>
            </div>
            
            <p className="text-[10px] text-neutral-400 group-hover:text-neutral-300 relative z-10 transition-colors">
                服务器由开发者自费维护，感谢您的支持与鼓励 ❤️
            </p>
        </button>

        <button 
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="w-full mt-2 group relative px-6 py-3 bg-black/40 border border-white/10 rounded-full text-neutral-400 text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
               <span className="animate-spin">✦</span> 生成中...
            </>
          ) : (
            <>
               <span>✦</span> 生成结案报告
            </>
          )}
        </button>
      </div>

      {/* 隐藏的截图用组件 */}
      <div className="absolute left-[-9999px] top-[-9999px]">
          <ShareCard 
            ref={shareCardRef}
            question={question}
            cards={cards}
            result={result}
            spreadConfig={spreadConfig}
          />
      </div>

      {/* 赞赏模态框 */}
      <DonateModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />

      {/* 图片预览模态框 */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleClosePreview}>
           
           {/* 中间紧凑的容器 */}
           <div 
             className="relative flex flex-col items-center bg-[#0a0a0a] border border-mystic-gold/20 rounded-xl p-4 shadow-2xl max-w-[90vw] max-h-[90vh]" 
             onClick={(e) => e.stopPropagation()}
           >
              {/* 图片容器 - 允许滚动如果太长 */}
              <div className="relative overflow-auto custom-scrollbar rounded-lg mb-4 max-h-[calc(90vh-100px)]">
                 <img src={previewImage} alt="Generated Tarot Reading" className="w-auto h-auto max-w-full object-contain block" />
              </div>

              {/* 提示语 */}
              <p className="text-mystic-gold/60 text-[10px] tracking-widest animate-pulse">长按保存 · Long Press to Save</p>

              {/* 底部按钮组 - 更紧凑 */}
              <div className="flex gap-3 w-full max-w-[300px] pt-2">
                 <button 
                    onClick={handleClosePreview}
                    className="flex-1 py-2.5 rounded-full border border-white/10 text-white/60 text-[10px] tracking-widest uppercase hover:bg-white/10 transition-colors backdrop-blur-md"
                 >
                    关闭 Close
                 </button>
                 <button 
                    onClick={handleShareOrSave}
                    className="flex-1 py-2.5 rounded-full bg-mystic-gold text-black text-[10px] tracking-widest uppercase text-center font-bold hover:bg-yellow-500 transition-colors shadow-lg"
                 >
                    保存 Save
                 </button>
              </div>
           </div>

           {/* 成功 Toast */}
           {showToast && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-6 py-2 rounded-full text-xs tracking-wider shadow-xl backdrop-blur-sm z-[60]">
                  ✨ Saved Successfully
              </div>
           )}
        </div>
      )}
    </motion.div>
  );
};
