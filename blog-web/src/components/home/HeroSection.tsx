import { getSiteInfo, getAuthorInfo, getCoverConfig } from '@/lib/api/config.server';
import HeroSectionClient from './HeroSectionClient';

interface HeroSectionProps {
  articleCount: number;
  tagCount: number;
  categoryCount: number;
}

export default async function HeroSection({ articleCount, tagCount, categoryCount }: HeroSectionProps) {
  const [site, author, cover] = await Promise.all([
    getSiteInfo(),
    getAuthorInfo(),
    getCoverConfig(),
  ]);

  return (
    <HeroSectionClient
      siteName={site.name || 'Blog'}
      siteNotice={site.notice}
      siteDescription={site.description}
      authorSignature={author.signature}
      coverImage={cover.home}
      articleCount={articleCount}
      tagCount={tagCount}
      categoryCount={categoryCount}
    />
  );
}
