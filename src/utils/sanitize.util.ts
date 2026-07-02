import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'a', 'hr', 'br', 'div', 'span',
];

const ALLOWED_ATTRS = { a: ['href', 'target', 'rel'], '*': ['style'] };

export function sanitizeContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
      }),
    },
  });
}
