import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import MomentList from '@/components/moment/MomentList';
import Pagination from '@/components/common/Pagination';
import { momentApi } from '@/lib/api/moment';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.HOME;

export default async function MomentPage({
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
    const momentList = await momentApi.getList(currentPage, 10);

    return (
      <>
        <Header />
        <PageHeader title={t('moments')} description="记录生活的瞬间" />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <div className="max-w-4xl mx-auto">
            <MomentList moments={momentList.records} />
            <Pagination
              current={momentList.current}
              total={momentList.pages}
              basePath="/moment"
            />
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load moments:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('moments')} description="记录生活的瞬间" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

