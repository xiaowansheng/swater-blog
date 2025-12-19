import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { friendLinkApi } from '@/lib/api/friendLink';
import { ISR_REVALIDATE } from '@/lib/constants';
import Image from 'next/image';

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
        <main className="container mx-auto px-4 py-8 flex-1">
          <h1 className="text-4xl font-bold mb-8">{t('friendLinks')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friendLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  {link.avatar && (
                    <Image
                      src={link.avatar}
                      alt={link.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <h2 className="text-xl font-bold">{link.name}</h2>
                </div>
                {link.description && (
                  <p className="text-foreground/70">{link.description}</p>
                )}
              </a>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Failed to load friend links:', error);
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

