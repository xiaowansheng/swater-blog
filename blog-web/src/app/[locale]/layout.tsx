import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import type { Metadata } from 'next';
import { Nunito, Varela_Round, Noto_Sans_SC } from 'next/font/google';
import '@/styles/globals.css';
import { getSiteInfo, getServerConfig } from '@/lib/api/config.server';
import { SiteConfigProvider } from '@/lib/context/SiteConfigContext';
import { getFullUrl } from '@/lib/utils/format';
import VisitorTracker from '@/components/visitor/VisitorTracker';
import { Toaster } from 'react-hot-toast';
import { DecorationProvider } from '@/lib/context/DecorationContext';
import DecorationManager from '@/components/decoration/DecorationManager';
import PageLoadingWrapper from '@/components/common/PageLoadingWrapper';
import TopProgressBar from '@/components/common/TopProgressBar';
import FloatingToolbar from '@/components/widgets/FloatingToolbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteInfo();
  const favicon = site.favicon ? getFullUrl(site.favicon) : '/favicon.svg';
  const faviconType = (() => {
    const lower = favicon.toLowerCase();
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.ico')) return 'image/x-icon';
    return undefined;
  })();

  return {
    title: site.name || 'Blog',
    description: site.description || 'A modern blog platform',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: favicon, ...(faviconType ? { type: faviconType } : {}) },
      ],
    },
  };
}

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
              <TopProgressBar />
              <PageLoadingWrapper>
                <div className="flex min-h-screen flex-col relative">
                  <DecorationManager />
                  <FloatingToolbar />
                  <VisitorTracker />
                  <Header />
                  <div className="flex-1">
                    {children}
                  </div>
                  <Footer />
                </div>
              </PageLoadingWrapper>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--primary) / 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '16px 20px',
                    minWidth: '300px',
                  },
                  success: {
                    style: {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#10b981',
                    },
                  },
                  error: {
                    style: {
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: '#ef4444',
                    },
                  },
                  loading: {
                    style: {
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                      color: 'white',
                      border: '1px solid hsl(var(--primary) / 0.3)',
                    },
                    iconTheme: {
                      primary: 'white',
                      secondary: 'hsl(var(--primary))',
                    },
                  },
                }}
              />
            </DecorationProvider>
          </SiteConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

