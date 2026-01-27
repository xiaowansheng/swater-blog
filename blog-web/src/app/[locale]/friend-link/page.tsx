import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import FriendLinkPageComponent from '@/components/friendLink/FriendLinkPage';
import { friendLinkApi } from '@/lib/api/friendLink';
import { getCoverConfig } from '@/lib/api/config.server';
import { DEFAULT_COVER_CONFIG, ISR_REVALIDATE } from '@/lib/constants';
import type { FriendLinkVO } from '@/types';

export const revalidate = ISR_REVALIDATE.FRIEND_LINK;

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
          <p>{t('noData')}</p>
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
