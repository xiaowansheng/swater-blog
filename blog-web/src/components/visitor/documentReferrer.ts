'use client';

declare global {
  interface Window {
    __blogInitialDocumentNavigationTracked__?: boolean;
  }
}

const INITIAL_DOCUMENT_NAVIGATION_FLAG = '__blogInitialDocumentNavigationTracked__';

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/^www\./, '');
}

function isSameSiteReferrer(referer: string, pageUrl: string) {
  try {
    const refererUrl = new URL(referer);
    const currentUrl = new URL(pageUrl);
    return normalizeHostname(refererUrl.hostname) === normalizeHostname(currentUrl.hostname);
  } catch {
    return false;
  }
}

export function consumeDocumentNavigationEntry(pageUrl: string): {
  documentNavigation: boolean;
  referer?: string;
} {
  if (typeof window === 'undefined') {
    return { documentNavigation: false };
  }

  const documentNavigation = !window[INITIAL_DOCUMENT_NAVIGATION_FLAG];
  if (!documentNavigation) {
    return { documentNavigation: false };
  }

  window[INITIAL_DOCUMENT_NAVIGATION_FLAG] = true;

  const referer = document.referrer || '';
  if (!referer || isSameSiteReferrer(referer, pageUrl)) {
    return { documentNavigation: true };
  }

  return {
    documentNavigation: true,
    referer,
  };
}
