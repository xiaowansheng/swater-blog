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

  try {
    const currentPage = parseInt(page, 10) || 1;
    const guestbook = await guestbookApi.getList(currentPage, 10);

    return (
      <>
        <Header />
        <PageHeader title={t('guestbook')} description="留下你的足迹" />
        <main className="container flex-1 px-4 py-12 mx-auto">
          {/* <div className="mb-10">
            <h1 className="mb-4 text-5xl font-bold gradient-text">{t('guestbook')}</h1>
            <p className="text-lg text-muted">留下你的足迹</p>
          </div> */}
          <div className="mb-10">
            <CommentForm />
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
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load guestbook:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('guestbook')} description="留下你的足迹" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

