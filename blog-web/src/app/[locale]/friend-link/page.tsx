import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/layout/PageHeader';
import FriendLinkPageComponent from '@/components/friendLink/FriendLinkPage';
import { friendLinkApi } from '@/lib/api/friendLink';
import { ISR_REVALIDATE } from '@/lib/constants';
import { getCoverConfig } from '@/lib/api/config.server';

export const revalidate = ISR_REVALIDATE.FRIEND_LINK;

export default async function FriendLinkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const [friendLinks, cover] = await Promise.all([
      friendLinkApi.getList(),
      getCoverConfig()
    ]);

    return (
      <>
        <PageHeader title={t('friendLinks')} description="友情链接" coverImage={cover.link} />
        <FriendLinkPageComponent friendLinks={friendLinks} />
        
      </>
    );
  } catch (error) {
    console.error('Failed to load friend links:', error);
    const cover = await getCoverConfig();
    return (
      <>
        <PageHeader title={t('friendLinks')} description="友情链接" coverImage={cover.link} />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        
      </>
    );
  }
}

