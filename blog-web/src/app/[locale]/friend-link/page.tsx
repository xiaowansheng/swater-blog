import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import { friendLinkApi } from '@/lib/api/friendLink';
import { ISR_REVALIDATE } from '@/lib/constants';
import Image from '@/components/common/ImageWithPreview';

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
        <main className="container flex-1 px-3 sm:px-4 py-8 sm:py-12 mx-auto">
          {friendLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">暂无友情链接</h3>
              <p className="text-foreground/60">博主正在努力添加中，敬请期待...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {friendLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 sm:p-6 transition-all duration-300 border rounded-xl group bg-card border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {link.avatar ? (
                      <Image
                        src={link.avatar}
                        alt={link.name}
                        width={56}
                        height={56}
                        className="transition-colors border-2 rounded-full border-border group-hover:border-primary w-12 h-12 sm:w-14 sm:h-14"
                        previewEnabled={false}
                      />
                    ) : (
                      <div className="flex items-center justify-center transition-colors border-2 rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 border-border group-hover:border-primary">
                        <span className="text-lg sm:text-xl font-bold text-primary">{link.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <h2 className="text-base sm:text-lg md:text-xl font-bold transition-colors group-hover:text-primary line-clamp-1">{link.name}</h2>
                  </div>
                  {link.description && (
                    <p className="text-xs sm:text-sm text-foreground/70 line-clamp-2">{link.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm transition-opacity opacity-0 text-primary group-hover:opacity-100">
                    <span>访问网站</span>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
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

