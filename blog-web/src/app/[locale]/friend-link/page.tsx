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
        <main className="container flex-1 px-4 py-12 mx-auto">
          <div className="mb-10">
            <h1 className="mb-4 text-5xl font-bold gradient-text">{t('friendLinks')}</h1>
            <p className="text-lg text-muted">友情链接</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {friendLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl border transition-all duration-300 group bg-card border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex gap-4 items-center mb-4">
                  {link.avatar ? (
                    <Image
                      src={link.avatar}
                      alt={link.name}
                      width={56}
                      height={56}
                      className="rounded-full border-2 transition-colors border-border group-hover:border-primary"
                    />
                  ) : (
                    <div className="flex justify-center items-center w-14 h-14 rounded-full border-2 transition-colors bg-primary/10 border-border group-hover:border-primary">
                      <span className="text-xl font-bold text-primary">{link.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <h2 className="text-xl font-bold transition-colors group-hover:text-primary">{link.name}</h2>
                </div>
                {link.description && (
                  <p className="text-foreground/70 line-clamp-2">{link.description}</p>
                )}
                <div className="flex gap-2 items-center mt-4 text-sm opacity-0 transition-opacity text-primary group-hover:opacity-100">
                  <span>访问网站</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
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
        <main className="container flex-1 px-4 py-8 mx-auto">
          <p>{t('noData')}</p>
        </main>
        <Footer />
      </>
    );
  }
}

