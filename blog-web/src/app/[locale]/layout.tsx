import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { SiteConfigProvider } from '@/lib/context/SiteConfigContext';
import { getPublicConfig } from '@/lib/api/config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  let siteName = 'Blog';
  let siteDescription = 'A modern blog platform';
  
  try {
    const config = await getPublicConfig();
    siteName = config.site?.name || siteName;
    siteDescription = config.site?.description || siteDescription;
  } catch (error) {
    console.warn('Failed to load site config for metadata');
  }
  
  return {
    title: siteName,
    description: siteDescription,
    alternates: {
      languages: {
        'zh': '/zh',
        'en': '/en',
      },
    },
  };
}

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
  
  // 获取配置数据
  let initialConfig = undefined;
  try {
    initialConfig = await getPublicConfig();
  } catch (error) {
    console.warn('Failed to load site config');
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <SiteConfigProvider initialConfig={initialConfig}>
            <div className="flex min-h-screen flex-col">
              {children}
            </div>
          </SiteConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

