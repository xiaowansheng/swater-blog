
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import CommentList from '@/components/comment/CommentList';
import CommentForm from '@/components/comment/CommentForm';
import { guestbookApi } from '@/lib/api/guestbook';

export default async function GuestbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = '1' } = await searchParams;
  const t = await getTranslations('common');
  const tGuestbook = await getTranslations('guestbook');

  try {
    const currentPage = parseInt(page, 10) || 1;
    const guestbook = await guestbookApi.getList(currentPage, 10);

    return (
      <>
        <Header />
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
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="relative">
                      <div className="relative rounded-[26px] border border-primary/15 bg-card/70 p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-primary">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15l4 4 12-12" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">{tGuestbook('messageList')}</h3>
                          <span className="rounded-full border border-primary/15 bg-card/80 px-3 py-1 text-xs text-primary/70">
                            {guestbook.records.length} {tGuestbook('messageCount')}
                          </span>
                        </div>
                        {guestbook.records.length > 0 ? (
                          <CommentList comments={guestbook.records} />
                        ) : (
                          <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
                            <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
                            <div className="relative z-10">
                              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noGuestbook')}</h3>
                              <p className="text-sm sm:text-base text-muted-foreground">{t('noGuestbookHint')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="sticky top-20">
                        <div className="relative rounded-[28px] border border-primary/20 bg-gradient-to-br from-card via-secondary/30 to-primary/10 p-6 shadow-[0_28px_60px_-45px_rgba(244,114,182,0.55)]">
                          <div className="absolute -top-8 right-8 h-16 w-16 rounded-full bg-deco-pink/30 blur-2xl"></div>
                          <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 text-primary">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4 0 1.38.7 2.6 1.77 3.33L12 20l2.23-4.67A4 4 0 0016 12c0-2.21-1.79-4-4-4z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{tGuestbook('writeMessage')}</h3>
                              <p className="text-sm text-muted-foreground">{tGuestbook('messageHint')}</p>
                            </div>
                          </div>
                          <CommentForm targetType="TALK" />
                          <div className="mt-6 rounded-[20px] border border-accent/15 bg-card/70 px-5 py-4 text-sm text-muted-foreground shadow-sm">
                            <p className="font-semibold text-foreground/80">{tGuestbook('tips')}</p>
                            <p className="mt-2 leading-relaxed">{tGuestbook('tipsContent')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute -bottom-6 left-1/2 hidden h-16 w-16 -translate-x-1/2 rounded-full bg-deco-pink/30 blur-2xl sm:block"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load guestbook:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('guestbook')} description={tGuestbook('description')} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}
