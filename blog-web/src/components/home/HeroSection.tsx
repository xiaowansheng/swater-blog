import { getSiteInfo, getCoverConfig } from '@/lib/api/config.server';
import HeroSectionClient from './HeroSectionClient';

interface HeroSectionProps {
  articleCount: number;
  tagCount: number;
  categoryCount: number;
}

export default async function HeroSection({ articleCount, tagCount, categoryCount }: HeroSectionProps) {
  const [site, cover] = await Promise.all([
    getSiteInfo(),
    getCoverConfig(),
  ]);

  return (
    <HeroSectionClient
      siteName={site.name || 'Blog'}
      siteNotice={site.notice}
      siteDescription={site.description}
      coverImage={cover.home}
      articleCount={articleCount}
      tagCount={tagCount}
      categoryCount={categoryCount}
    />
  );
}
