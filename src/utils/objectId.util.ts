import { Types } from 'mongoose';

/**
 * Mongoose's Document.toString() returns util.inspect() output, not the hex id —
 * so populated refs can't be compared with plain `.toString() === someId`.
 * This extracts the id whichever form the field is in (raw ObjectId or populated doc).
 */
export function toIdString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}
