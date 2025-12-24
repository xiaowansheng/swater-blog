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
          <div className="mb-10">
            <h1 className="mb-4 text-5xl font-bold gradient-text">{t('guestbook')}</h1>
            <p className="text-lg text-muted">留下你的足迹</p>
          </div>
          <div className="mb-10">
            <CommentForm />
          </div>
          <CommentList comments={guestbook.records} />
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

