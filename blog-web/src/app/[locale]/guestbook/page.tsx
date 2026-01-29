import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import GuestbookSection from '@/components/guestbook/GuestbookSection';
import ComponentDisabledNotice from '@/components/common/ComponentDisabledNotice';
import { guestbookApi } from '@/lib/api/guestbook';
import { getCoverConfig, getComponentConfig } from '@/lib/api/config.server';
import type { GuestbookVO } from '@/types';


export const dynamic = 'force-dynamic';

export default async function GuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; size?: string }>;
}) {
  const { page = '1', sort = 'desc', size } = await searchParams;

  const currentPage = parseInt(page, 10) || 1;
  const pageSize = parseInt(size || '') || 20;
  const t = await getTranslations('common');
  const tGuestbook = await getTranslations('guestbook');

  let guestbookRecords: GuestbookVO[] = [];
  let guestbookTotal = 0;
  let hasGuestbookError = false;

  const [cover, componentConfig] = await Promise.all([
    getCoverConfig(),
    getComponentConfig(),
  ]);

  try {
    const guestbook = await guestbookApi.getList(currentPage, pageSize, sort);
    guestbookRecords = guestbook.records || [];
    guestbookTotal = guestbook.total || 0;
  } catch (err) {
    console.error('Failed to load guestbook:', err);
    hasGuestbookError = true;
  }

  if (hasGuestbookError) {
    return (
      <>
        <PageHeader title={t('guestbook')} description={tGuestbook('description')} coverImage={cover.message} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
            <div className="absolute inset-0 bg-gradient-to-br via-transparent from-red-500/10 to-orange-500/10"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-red-500/20 to-orange-500/20">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('error')}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{t('apiNotConnected')}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('guestbook')}
        description={tGuestbook('description')}
        coverImage={cover.message}
      />
      <main className="container relative flex-1 px-4 pb-20 mx-auto">
        <section className="relative mt-8">
          <div className="pointer-events-none absolute -top-20 left-0 h-40 w-40 rounded-full bg-primary/20 dark:bg-primary/10 blur-3xl"></div>
          <div className="pointer-events-none absolute top-10 right-10 h-36 w-36 rounded-full bg-accent/20 dark:bg-accent/10 blur-3xl"></div>

          {componentConfig.guestbookMessageEnabled ? (
            <div className="relative rounded-[36px] border border-primary/15 bg-gradient-to-br from-white/80 via-secondary/40 to-primary/10 dark:from-card/40 dark:via-secondary/10 dark:to-primary/5 p-1 shadow-[0_32px_90px_-60px_rgba(96,165,250,0.55)] dark:shadow-none">
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
                    total={guestbookTotal}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    sort={sort}
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
