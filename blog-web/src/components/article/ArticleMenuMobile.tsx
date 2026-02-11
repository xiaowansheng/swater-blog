'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import { useTranslations } from 'next-intl';
import ArticleToc from './ArticleToc';
import type { PostVO } from '@/types';

interface ArticleMenuMobileProps {
  article: PostVO;
}

export default function ArticleMenuMobile({ article }: ArticleMenuMobileProps) {
  const t = useTranslations('common');
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'toc' | 'share' | 'tools'>('toc');

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    await copyToClipboard(articleUrl);
  };

  const handleShare = (platform: string) => {
    const title = encodeURIComponent(article.title);
    const url = encodeURIComponent(articleUrl);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      weibo: `https://service.weibo.com/share/share.php?title=${title}&url=${url}`,
      qq: `https://connect.qq.com/widget/shareqq/index.html?title=${title}&url=${url}`,
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // const handlePrint = () => {
  //   window.print();
  // };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToComment = () => {
    const commentSection = document.getElementById('anime-comment');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  return (
    <div className="lg:hidden">
      {/* 浮动按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 bg-gradient-to-br from-deco-pink via-primary to-deco-blue text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
        style={{ borderRadius: '50%' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* 背景装饰圆环 */}
        <div className="absolute inset-1 border-2 border-white/20 rounded-full" />
        <div className="absolute inset-2 border border-white/10 rounded-full" />
        
        {/* 浮动的小星星 */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-2 right-3 w-1.5 h-1.5 bg-white rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-3 left-2 w-1 h-1 bg-white rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute top-4 left-4 w-0.5 h-0.5 bg-white rounded-full"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* 主图标 */}
        <motion.div
          className="relative z-10"
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <motion.svg 
              className="w-7 h-7" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* 可爱的书本图标 */}
              <div className="relative">
                <motion.svg 
                  className="w-7 h-7" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ 
                    rotateY: [0, 10, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </motion.svg>
                {/* 小爱心装饰 */}
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 text-pink-200"
                  animate={{ 
                    scale: [0.8, 1.2, 0.8],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 悬停时的彩虹光晕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        
        {/* 点击时的涟漪效果 */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.4 }}
        />
      </motion.button>

      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* 底部弹出菜单 */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-card via-card to-card/95 border-t border-border/50 shadow-2xl overflow-hidden"
        style={{ borderRadius: '24px 24px 0 0' }}
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* 装饰性背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="relative p-4">
          {/* 拖拽指示器 */}
          <motion.div 
            className="w-12 h-1.5 bg-gradient-to-r from-deco-pink via-primary to-deco-blue rounded-full mx-auto mb-4 shadow-sm"
            animate={{ 
              scaleX: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* 标签页头部 */}
          <div className="flex border-b border-border/30 mb-4 bg-muted/20 rounded-lg p-1">
            <motion.button
              onClick={() => setActiveTab('toc')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
                activeTab === 'toc'
                  ? 'text-white bg-gradient-to-r from-deco-pink to-primary shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📖 目录
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('share')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
                activeTab === 'share'
                  ? 'text-white bg-gradient-to-r from-primary to-deco-blue shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🌟 分享
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
                activeTab === 'tools'
                  ? 'text-white bg-gradient-to-r from-deco-blue to-deco-pink shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🛠️ 工具
            </motion.button>
          </div>

          {/* 内容区域 */}
          <motion.div 
            className="max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {activeTab === 'toc' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ArticleToc />
              </motion.div>
            )}

            {activeTab === 'share' && (
              <motion.div 
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200/30"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">复制链接</div>
                    {isCopied && <div className="text-green-500 text-xs">✓ 已复制</div>}
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleShare('weibo')}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-red-200/30"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.31 8.17c-.36.06-.6.39-.54.75.06.36.39.6.75.54 2.04-.34 3.54.17 4.15 1.42.61 1.25.06 2.87-1.53 4.47-1.59 1.6-3.21 2.15-4.46 1.54-1.25-.61-1.76-2.11-1.42-4.15.06-.36-.18-.69-.54-.75-.36-.06-.69.18-.75.54-.46 2.73.29 4.93 2.08 6.08 1.79 1.15 4.18.61 6.58-1.79 2.4-2.4 2.94-4.79 1.79-6.58-1.15-1.79-3.35-2.54-6.08-2.08z"/>
                    </svg>
                  </div>
                  <div className="font-medium">微博</div>
                </motion.button>

                <motion.button
                  onClick={() => handleShare('qq')}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200/30"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <div className="font-medium">QQ</div>
                </motion.button>

                <motion.button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-gradient-to-r hover:from-sky-500/10 hover:to-blue-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-sky-200/30"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <div className="font-medium">Twitter</div>
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* <motion.button
                  onClick={handlePrint}
                  className="flex items-center gap-3 w-full p-3 text-sm text-left hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-purple-200/30"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <span className="font-medium">🖨️ 打印文章</span>
                </motion.button> */}

                <motion.button
                  onClick={handleScrollToTop}
                  className="flex items-center gap-3 w-full p-3 text-sm text-left hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-green-200/30"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <span className="font-medium">⬆️ {t('jumpToTop')}</span>
                </motion.button>

                <motion.button
                  onClick={handleScrollToComment}
                  className="flex items-center gap-3 w-full p-3 text-sm text-left hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200/30"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="font-medium">💬 {t('jumpToComment')}</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}