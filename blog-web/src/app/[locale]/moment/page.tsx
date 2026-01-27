import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import MomentList from '@/components/moment/MomentList';
import Pagination from '@/components/common/Pagination';
import { momentApi } from '@/lib/api/moment';
import { getCoverConfig } from '@/lib/api/config.server';
import {
  DEFAULT_COVER_CONFIG,
  ISR_REVALIDATE,
  PAGINATION_DEFAULT_SIZE,
} from '@/lib/constants';
import type { MomentVO, PageResult } from '@/types';

export const revalidate = ISR_REVALIDATE.MOMENT;

const EMPTY_MOMENT_LIST: PageResult<MomentVO> = {
  records: [],
  total: 0,
  size: PAGINATION_DEFAULT_SIZE,
  current: 1,
  pages: 0,
};

export default async function MomentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = '1' } = await searchParams;
  const t = await getTranslations('common');
  const currentPage = parseInt(page, 10) || 1;

  let cover = DEFAULT_COVER_CONFIG;
  try {
    cover = await getCoverConfig();
  } catch (error) {
    console.error('Failed to load cover config:', error);
  }

  let momentList: PageResult<MomentVO> = EMPTY_MOMENT_LIST;
  let hasError = false;
  try {
    momentList = await momentApi.getList(currentPage, PAGINATION_DEFAULT_SIZE);
  } catch (error) {
    console.error('Failed to load moments:', error);
    hasError = true;
  }

  if (hasError) {
    return (
      <>
        <PageHeader title={t('moments')} description={t('momentsDescription')} coverImage={cover.talk} />
        <main className="container flex-1 px-4 py-12 mx-auto">
          <p>{t('noData')}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('moments')} description={t('momentsDescription')} coverImage={cover.talk} />
      <main className="container flex-1 px-4 py-12 mx-auto">
        <div className="max-w-4xl mx-auto" id="moment-list">
          {momentList.records.length > 0 ? (
            <>
              <MomentList moments={momentList.records} />
              <Pagination
                current={momentList.current}
                total={momentList.pages}
                totalCount={momentList.total}
                basePath="/moment"
                pageSize={momentList.size}
                scrollToId="moment-list"
              />
            </>
          ) : (
            <div className="overflow-hidden relative p-8 sm:p-12 md:p-16 text-center modern-card">
              <div className="absolute inset-0 bg-gradient-to-br via-transparent from-primary/5 to-accent/5"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br rounded-2xl from-primary/20 to-accent/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-foreground/80">{t('noMoments')}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{t('noMomentsHint')}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
