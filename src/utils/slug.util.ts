import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

export const generateSlug = (text: string): string => {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  const unique = uuidv4().split('-')[0];
  return `${base}-${unique}`;
};
