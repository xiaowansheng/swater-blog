import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">{t('guestbook')}</h1>
          <div className="mb-8">
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
        <main className="container mx-auto px-4 py-8 flex-1">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

