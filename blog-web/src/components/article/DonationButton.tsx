'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSiteConfig } from '@/lib/context/SiteConfigContext';
import { getFullUrl } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';

export default function DonationButton() {
  const t = useTranslations('article');
  const { reward } = useSiteConfig();
  const { rewardEnabled, wechat, alipay } = reward || {};

  const hasWechat = wechat?.enabled !== false && !!wechat?.qr;
  const hasAlipay = alipay?.enabled !== false && !!alipay?.qr;

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'wechat' | 'alipay'>(hasWechat ? 'wechat' : 'alipay');

  if (rewardEnabled === false || (!hasWechat && !hasAlipay)) return null;

  return (
    <>
      <div className="flex justify-center mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setVisible(true)}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 hover:shadow-md hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5 text-amber-500 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {t('donation')}
          </span>
        </button>
      </div>

      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setVisible(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{t('donation')}</h3>
              <button
                onClick={() => setVisible(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-muted-foreground text-center mb-4">
              {t('donationDesc')}
            </p>

            <div className="flex gap-2 mb-4">
              {hasWechat && (
                <button
                  onClick={() => setTab('wechat')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === 'wechat'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.952-7.062-6.122zm-2.18 2.769c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z" />
                  </svg>
                  {t('donationWechat')}
                </button>
              )}
              {hasAlipay && (
                <button
                  onClick={() => setTab('alipay')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === 'alipay'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                  {t('donationAlipay')}
                </button>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center w-full aspect-square max-w-[240px] mx-auto">
              {tab === 'wechat' && hasWechat && wechat?.qr ? (
                <Image src={getFullUrl(wechat.qr)} alt="微信赞赏码" width={240} height={240} className="w-full h-full object-contain rounded-lg" unoptimized />
              ) : tab === 'alipay' && hasAlipay && alipay?.qr ? (
                <Image src={getFullUrl(alipay.qr)} alt="支付宝收款码" width={240} height={240} className="w-full h-full object-contain rounded-lg" unoptimized />
              ) : (
                <p className="text-sm text-muted-foreground">{t('donationNoQr')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
