import { Link } from '@/lib/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { getSiteInfo } from '@/lib/api/config.server';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const t = await getTranslations('nav');
  const site = await getSiteInfo();

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/archive', label: t('archives') },
    { href: '/moment', label: t('moments') },
    { href: '/guestbook', label: t('guestbook') },
    { href: '/friend-link', label: t('friendLinks') },
    { href: '/about', label: t('about') },
  ];

  return <HeaderClient siteName={site.name || 'Blog'} navItems={navItems} />;
}
