'use client';

import { Fragment, useMemo } from 'react';
import { Dialog, DialogTitle, Transition } from '@headlessui/react';
import { useTranslations } from 'next-intl';

interface ExternalLinkDialogProps {
  open: boolean;
  url: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 外链跳转确认弹窗
 *
 * 点击外链时拦截跳转，提示用户即将离开站点，确认后在新标签页打开。
 */
export default function ExternalLinkDialog({
  open,
  url,
  onConfirm,
  onCancel,
}: ExternalLinkDialogProps) {
  const t = useTranslations('markdown.externalLink');

  const displayUrl = useMemo(() => {
    if (!url) {
      return '';
    }

    // 超长 URL 做省略展示（保留协议 + host + 部分路径）
    try {
      const u = new URL(url);
      const host = `${u.protocol}//${u.host}`;
      const rest = url.slice(host.length);
      if (rest.length <= 60) {
        return url;
      }
      return `${host}${rest.slice(0, 50)}…`;
    } catch {
      return url.length > 80 ? `${url.slice(0, 80)}…` : url;
    }
  }, [url]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onCancel}>
        {/* 背景遮罩 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* 弹窗容器 */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* 图标 */}
              <div className="px-6 pt-6 pb-2 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* 标题（使用 DialogTitle 替代已弃用的 Dialog.Title） */}
              <DialogTitle className="px-6 pt-3 text-center text-lg font-semibold text-foreground">
                {t('title')}
              </DialogTitle>

              {/* 说明 */}
              <div className="px-6 pt-3 pb-4 text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">{t('warning')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{t('hint')}</p>
              </div>

              {/* URL 展示 */}
              <div className="mx-6 mb-5 px-3 py-2.5 rounded-lg bg-secondary/60 border border-border/60">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground/80 mb-1">
                  {t('target')}
                </div>
                <div
                  className="text-xs font-mono text-foreground break-all leading-snug"
                  title={url}
                >
                  {displayUrl}
                </div>
              </div>

              {/* 按钮 */}
              <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row sm:justify-center sm:gap-3 gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-secondary transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  <span>{t('confirm')}</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
