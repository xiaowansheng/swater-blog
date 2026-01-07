'use client';

import { useState } from 'react';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import ArticleToc from './ArticleToc';
import type { PostVO } from '@/types';

interface ArticleMenuProps {
  article: PostVO;
}

export default function ArticleMenu({ article }: ArticleMenuProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
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

  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="hidden lg:block sticky top-24 h-fit">
      <div className="w-64 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* 标签页头部 */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('toc')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'toc'
                ? 'text-primary bg-primary/5 border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            目录
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'share'
                ? 'text-primary bg-primary/5 border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            分享
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tools'
                ? 'text-primary bg-primary/5 border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            工具
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          {activeTab === 'toc' && (
            <div className="max-h-96 overflow-y-auto">
              <ArticleToc />
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="flex-1">复制链接</span>
                {isCopied && <span className="text-green-500 text-xs">已复制</span>}
              </button>

              <button
                onClick={() => handleShare('weibo')}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.31 8.17c-.36.06-.6.39-.54.75.06.36.39.6.75.54 2.04-.34 3.54.17 4.15 1.42.61 1.25.06 2.87-1.53 4.47-1.59 1.6-3.21 2.15-4.46 1.54-1.25-.61-1.76-2.11-1.42-4.15.06-.36-.18-.69-.54-.75-.36-.06-.69.18-.75.54-.46 2.73.29 4.93 2.08 6.08 1.79 1.15 4.18.61 6.58-1.79 2.4-2.4 2.94-4.79 1.79-6.58-1.15-1.79-3.35-2.54-6.08-2.08z"/>
                </svg>
                <span>分享到微博</span>
              </button>

              <button
                onClick={() => handleShare('qq')}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                <span>分享到QQ</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>分享到Twitter</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>分享到Facebook</span>
              </button>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>打印文章</span>
              </button>

              <button
                onClick={handleScrollToTop}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>回到顶部</span>
              </button>

              <button
                onClick={handleScrollToBottom}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>跳到底部</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}