'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from '@/components/common/ImageWithPreview';
import Modal from '@/components/common/Modal';
import FriendLinkApplicationForm from './FriendLinkApplicationForm';
import type { FriendLinkVO } from '@/types';
import { Card } from '@/components/ui/Card';

interface FriendLinkPageProps {
  friendLinks: FriendLinkVO[];
}

export default function FriendLinkPage({ friendLinks }: FriendLinkPageProps) {
  const t = useTranslations('friendLink');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<FriendLinkVO | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleApplicationSuccess = () => {
    setSubmitted(true);
    setIsModalOpen(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleLinkClick = (link: FriendLinkVO) => {
    setSelectedLink(link);
    setIsDetailModalOpen(true);
  };

  const handleVisitWebsite = () => {
    if (selectedLink?.url) {
      window.open(selectedLink.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div className="relative container flex-1 px-3 sm:px-4 py-8 sm:py-12 mx-auto">
        {/* 装饰背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/[0.03] to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-full pointer-events-none"></div>

        {/* 星星装饰 */}
        <div className="absolute top-8 right-8 text-accent/20 text-sm animate-twinkle pointer-events-none">✦</div>
        <div className="absolute bottom-12 right-16 text-primary/20 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '0.5s' }}>✧</div>
        <div className="absolute top-1/3 left-8 text-primary/10 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '1s' }}>✦</div>

        <div className="relative z-10">
          {submitted && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-500/10 animate-pulse"></div>
              <div className="absolute top-2 right-2 text-green-400/30 text-xs animate-twinkle">✦</div>
              <p className="relative z-10 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('applicationSubmitted')}
              </p>
            </div>
          )}

          {friendLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center relative">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] rounded-3xl"></div>

              <div className="relative z-10">
                <div className="relative mb-6">
                  {/* 图标光晕 */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-lg"></div>
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center ring-2 ring-primary/20">
                    <svg className="w-12 h-12 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {/* 装饰星星 */}
                    <div className="absolute -top-1 -right-1 text-accent/40 text-sm animate-bounce-soft">✦</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">{t('noFriendLinks')}</h3>
                <p className="text-foreground/60 mb-6">{t('noFriendLinksHint')}</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group relative px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 overflow-hidden mx-auto"
                >
                  {/* 按钮光泽 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('applyFriendLink')}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {friendLinks.map((link, index) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link)}
                    className="block w-full h-full text-left focus:outline-none"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Card 
                       className="group/link h-full p-3 sm:p-4 relative overflow-hidden" 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: index * 0.05 }}
                    >
                      {/* 悬停背景 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-500"></div>

                      {/* 装饰星星 */}
                      <div className="absolute top-1.5 right-1.5 text-primary/10 text-[8px] animate-twinkle">✦</div>
                      <div className="absolute bottom-2 left-2 text-accent/10 text-[8px] animate-twinkle" style={{ animationDelay: '0.5s' }}>✧</div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          {link.logo ? (
                            <div className="relative shrink-0">
                              {/* Logo光晕 */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-sm opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative">
                                <Image
                                  src={link.logo}
                                  alt={link.name}
                                  width={48}
                                  height={48}
                                  className="transition-all duration-300 border-2 rounded-full border-border group-hover/link:border-primary group-hover/link:scale-110 w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-transparent group-hover/link:ring-primary/20"
                                  previewEnabled={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="relative shrink-0">
                              {/* 首字母光晕 */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-sm opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></div>
                              <div className="flex items-center justify-center transition-all duration-300 border-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-accent/10 border-border group-hover/link:border-primary group-hover/link:scale-110 ring-2 ring-transparent group-hover/link:ring-primary/20">
                                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{link.name.charAt(0).toUpperCase()}</span>
                              </div>
                            </div>
                          )}
                          <h2 className="text-sm sm:text-base font-bold transition-colors group-hover/link:text-primary line-clamp-1 flex-1">{link.name}</h2>
                        </div>
                        {link.description && (
                          <p className="text-xs text-foreground/70 line-clamp-2 relative mb-2">
                            {link.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs transition-all duration-300 opacity-0 group-hover/link:opacity-100 transform translate-y-1 group-hover/link:translate-y-0 text-primary">
                          <span className="flex items-center gap-1">
                            {t('viewDetails')}
                            <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group relative px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 overflow-hidden"
                >
                  {/* 按钮光泽 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('applyFriendLink')}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('applyFriendLinkTitle')}
      >
        <FriendLinkApplicationForm
          onSuccess={handleApplicationSuccess}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={t('friendLinkDetail')}
      >
        {selectedLink && (
          <div className="space-y-6">
            {/* Logo和名称 */}
            <div className="flex items-center gap-4">
              {selectedLink.logo ? (
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-lg"></div>
                  <Image
                    src={selectedLink.logo}
                    alt={selectedLink.name}
                    width={80}
                    height={80}
                    className="relative w-20 h-20 border-4 rounded-full border-border ring-2 ring-primary/20"
                    previewEnabled={false}
                  />
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-lg"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 border-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-border ring-2 ring-primary/20">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {selectedLink.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                  {selectedLink.name}
                </h3>
                {selectedLink.author && (
                  <p className="text-sm text-foreground/70 mb-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {selectedLink.author}
                  </p>
                )}
                {selectedLink.url && (
                  <p className="text-xs text-foreground/60 break-all flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {selectedLink.url}
                  </p>
                )}
              </div>
            </div>

            {/* 描述 */}
            {selectedLink.description && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="text-sm font-semibold mb-2 text-foreground/80">{t('description')}</h4>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {selectedLink.description}
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleVisitWebsite}
                className="flex-1 group relative px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t('visitWebsite')}
                </span>
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-3 border-2 rounded-xl border-border hover:border-primary hover:bg-primary/5 transition-all font-medium text-foreground/80 hover:text-primary"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
