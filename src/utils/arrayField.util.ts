/**
 * Multipart/form-data can deliver a "multi-value" field as a real array (repeated
 * form fields), a JSON-stringified array, or a comma-separated string, depending on
 * the client. This normalizes any of those shapes into a clean string[].
 */
export function normalizeIdArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((v) => v.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((v) => v.trim()).filter(Boolean);
        }
      } catch {
        // not valid JSON — fall through to comma-split
      }
    }
    return trimmed.split(',').map((v) => v.trim()).filter(Boolean);
  }

  return [];
}
