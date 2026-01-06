import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import FriendLinkPageComponent from '@/components/friendLink/FriendLinkPage';
import { friendLinkApi } from '@/lib/api/friendLink';
import { ISR_REVALIDATE } from '@/lib/constants';

export const revalidate = ISR_REVALIDATE.FRIEND_LINK;

export default async function FriendLinkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('common');

  try {
    const friendLinks = await friendLinkApi.getList();

    return (
      <>
        <Header />
        <PageHeader title={t('friendLinks')} description="友情链接" />
        <FriendLinkPageComponent friendLinks={friendLinks} />
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load friend links:', error);
    return (
      <>
        <Header />
        <PageHeader title={t('friendLinks')} description="友情链接" />
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

