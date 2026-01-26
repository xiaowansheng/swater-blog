import { getSiteInfo } from '@/lib/api/config.server';
import { getFullUrl } from '@/lib/utils/format';

export default async function Head() {
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

  return (
    <>
      {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
      <link rel="icon" href={favicon} {...(faviconType ? { type: faviconType } : {})} />
    </>
  );
}
