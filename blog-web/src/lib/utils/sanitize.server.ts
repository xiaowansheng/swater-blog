import sanitizeHtml from 'sanitize-html';

const SERVER_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.filter(
    (tag) => !['base', 'embed', 'form', 'iframe', 'link', 'meta', 'object', 'script', 'style'].includes(tag),
  ),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    '*': ['class', 'title', 'aria-label'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
};

/** Server-only allowlist sanitization for HTML sent in server-rendered responses. */
export function sanitizeHtmlServer(html: string | undefined | null): string {
  if (!html) return '';
  return sanitizeHtml(html, SERVER_SANITIZE_OPTIONS);
}
