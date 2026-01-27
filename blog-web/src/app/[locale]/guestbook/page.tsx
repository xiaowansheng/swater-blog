import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import GuestbookSection from '@/components/guestbook/GuestbookSection';
import ComponentDisabledNotice from '@/components/common/ComponentDisabledNotice';
import { guestbookApi } from '@/lib/api/guestbook';
import { fetchServer } from '@/lib/api/server';
import { ISR_REVALIDATE, PAGINATION_DEFAULT_SIZE } from '@/lib/constants';
import type { GuestbookVO, ComponentConfig } from '@/types';

const DEFAULT_COMPONENT_CONFIG: ComponentConfig = {
  articleCommentEnabled: true,
  talkCommentEnabled: true,
  guestbookMessageEnabled: true,
};

export const revalidate = ISR_REVALIDATE.GUESTBOOK;

export default async function GuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const t = await getTranslations('common');
  const tGuestbook = await getTranslations('guestbook');

  let guestbookRecords: GuestbookVO[] = [];
  let componentConfig: ComponentConfig = DEFAULT_COMPONENT_CONFIG;
  let hasGuestbookError = false;

  try {
    const guestbook = await guestbookApi.getList(currentPage, PAGINATION_DEFAULT_SIZE);
    guestbookRecords = guestbook.records || [];
  } catch (err) {
    console.error('Failed to load guestbook:', err);
    hasGuestbookError = true;
  }

  try {
    const configs = await fetchServer<{ component?: ComponentConfig }>('/api/public/config');
    componentConfig = configs?.component || DEFAULT_COMPONENT_CONFIG;
  } catch (err) {
    console.error('Failed to load component config:', err);
    componentConfig = DEFAULT_COMPONENT_CONFIG;
  }

  if (hasGuestbookError) {
    return (
      <>
        <PageHeader title={t('guestbook')} description={tGuestbook('description')} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <div className="relative w-full overflow-hidden">
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-5 py-2 text-xs uppercase tracking-[0.32em] text-primary/70 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary/80"></span>
              Sweet Guestbook
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t('guestbook')}
              </span>
            </h1>
            <p className="mt-4 text-base text-muted sm:text-lg">{tGuestbook('description')}</p>
          </div>
        </div>
      </PageHeader>
      <main className="container relative flex-1 px-4 pb-20 mx-auto">
        <section className="relative mt-8">
          <div className="pointer-events-none absolute -top-20 left-0 h-40 w-40 rounded-full bg-deco-pink/40 blur-3xl"></div>
          <div className="pointer-events-none absolute top-10 right-10 h-36 w-36 rounded-full bg-deco-yellow/35 blur-3xl"></div>

          {componentConfig.guestbookMessageEnabled ? (
            <div className="relative rounded-[36px] border border-primary/15 bg-gradient-to-br from-white/80 via-secondary/40 to-primary/10 p-1 shadow-[0_32px_90px_-60px_rgba(96,165,250,0.55)]">
              <div className="rounded-[34px] bg-card/90 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/10 px-6 py-4 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary/60">Message Star</p>
                      <h2 className="text-xl font-semibold text-foreground">{t('guestbook')}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/70"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/70"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-deco-yellow/80"></span>
                  </div>
                </div>

                <div className="relative px-6 pb-10 pt-6 sm:px-8">
                  <GuestbookSection
                    initialMessages={guestbookRecords}
                    currentPage={currentPage}
                    pageSize={PAGINATION_DEFAULT_SIZE}
                  />

                  <div className="pointer-events-none absolute -bottom-6 left-1/2 hidden h-16 w-16 -translate-x-1/2 rounded-full bg-deco-pink/30 blur-2xl sm:block"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <ComponentDisabledNotice type="guestbook" />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
