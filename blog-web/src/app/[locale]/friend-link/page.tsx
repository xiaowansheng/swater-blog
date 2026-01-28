import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import FriendLinkPageComponent from '@/components/friendLink/FriendLinkPage';
import { friendLinkApi } from '@/lib/api/friendLink';
import { getCoverConfig } from '@/lib/api/config.server';
import { DEFAULT_COVER_CONFIG } from '@/lib/constants';
import type { FriendLinkVO } from '@/types';

export const revalidate = 1800;

export default async function FriendLinkPage() {
  const t = await getTranslations('common');

  let cover = DEFAULT_COVER_CONFIG;
  try {
    cover = await getCoverConfig();
  } catch (error) {
    console.error('Failed to load cover config:', error);
  }

  let friendLinks: FriendLinkVO[] = [];
  let hasError = false;
  try {
    friendLinks = await friendLinkApi.getList();
  } catch (error) {
    console.error('Failed to load friend links:', error);
    hasError = true;
  }

  if (hasError) {
    return (
      <>
        <PageHeader
          title={t('friendLinks')}
          description={t('friendLinksDescription')}
          coverImage={cover.link}
        />
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
        title={t('friendLinks')}
        description={t('friendLinksDescription')}
        coverImage={cover.link}
      />
      <FriendLinkPageComponent friendLinks={friendLinks} />
    </>
  );
}
