'use client';

import { useState } from 'react';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import ArticleToc from './ArticleToc';
import type { PostVO } from '@/types';

interface ArticleMenuMobileProps {
  article: PostVO;
}

export default function ArticleMenuMobile({ article }: ArticleMenuMobileProps) {
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

  const handlePrint = () => {
    window.print();
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden">
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        style={{ borderRadius: '50%' }}
      >
        {isOpen ? (
          <svg 
            className="w-6 h-6 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg 
            className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* 遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 底部弹出菜单 */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl transform transition-transform duration-300
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="p-4">
          {/* 拖拽指示器 */}
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />

          {/* 标签页头部 */}
          <div className="flex border-b border-border mb-4">
            <button
              onClick={() => setActiveTab('toc')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'toc'
                  ? 'text-primary bg-primary/5 border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              目录
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'share'
                  ? 'text-primary bg-primary/5 border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              分享
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'text-primary bg-primary/5 border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              工具
            </button>
          </div>

          {/* 内容区域 */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'toc' && (
              <ArticleToc />
            )}

            {activeTab === 'share' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-muted/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>复制链接</span>
                  {isCopied && <span className="text-green-500 text-xs">✓</span>}
                </button>

                <button
                  onClick={() => handleShare('weibo')}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-muted/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.31 8.17c-.36.06-.6.39-.54.75.06.36.39.6.75.54 2.04-.34 3.54.17 4.15 1.42.61 1.25.06 2.87-1.53 4.47-1.59 1.6-3.21 2.15-4.46 1.54-1.25-.61-1.76-2.11-1.42-4.15.06-.36-.18-.69-.54-.75-.36-.06-.69.18-.75.54-.46 2.73.29 4.93 2.08 6.08 1.79 1.15 4.18.61 6.58-1.79 2.4-2.4 2.94-4.79 1.79-6.58-1.15-1.79-3.35-2.54-6.08-2.08z"/>
                  </svg>
                  <span>微博</span>
                </button>

                <button
                  onClick={() => handleShare('qq')}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-muted/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <span>QQ</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 p-3 text-sm text-left hover:bg-muted/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-3 w-full p-3 text-sm text-left hover:bg-muted/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>打印文章</span>
                </button>

                <button
                  onClick={handleScrollToTop}
                  className="flex items-center gap-3 w-full p-3 text-sm text-left hover:bg-muted/50 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span>回到顶部</span>
                </button>

                <div className="pt-3 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                    <div>
                      <div className="font-medium">{article.content?.length || 0}</div>
                      <div>字数</div>
                    </div>
                    <div>
                      <div className="font-medium">{article.viewCount || 0}</div>
                      <div>阅读</div>
                    </div>
                    <div>
                      <div className="font-medium">{article.likeCount || 0}</div>
                      <div>点赞</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}