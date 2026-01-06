import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import type { Metadata } from 'next';
import { Nunito, Varela_Round, Noto_Sans_SC } from 'next/font/google';
import '@/styles/globals.css';
import { getSiteInfo, getServerConfig } from '@/lib/api/config.server';
import { SiteConfigProvider } from '@/lib/context/SiteConfigContext';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

const varelaRound = Varela_Round({
  variable: '--font-varela-round',
  subsets: ['latin'],
  weight: '400',
});

const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteInfo();
  
  return {
    title: site.name || 'Blog',
    description: site.description || 'A modern blog platform',
    icons: site.favicon ? { icon: site.favicon } : undefined,
    alternates: {
      languages: {
        'zh': '/zh',
        'en': '/en',
      },
    },
  };
}

import { DecorationProvider } from '@/lib/context/DecorationContext';
import DecorationManager from '@/components/decoration/DecorationManager';
import PageLoadingWrapper from '@/components/common/PageLoadingWrapper';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'zh' | 'en')) {
    notFound();
  }

  const messages = await getMessages();
  const config = await getServerConfig();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${varelaRound.variable} ${notoSansSC.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <SiteConfigProvider initialConfig={config}>
            <DecorationProvider>
              <PageLoadingWrapper>
                <div className="flex min-h-screen flex-col relative">
                  <DecorationManager />
                  {children}
                </div>
              </PageLoadingWrapper>
            </DecorationProvider>
          </SiteConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

