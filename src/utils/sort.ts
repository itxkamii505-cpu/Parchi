/**
 * Natural A-to-Z Alphanumeric Comparison Utility
 * Ensures usernames are ordered naturally:
 * "Abdullah", "Abdullah 1", "Abdullah 2", "Abdullah 10", "Ali", "Babar", etc.
 * Independent of the arbitrary arrival order in files or screenshots.
 */

export function naturalCompare(a: string, b: string): number {
  const strA = (a || '').trim();
  const strB = (b || '').trim();
  return strA.localeCompare(strB, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Sorts any client records naturally by username in pure A-to-Z order.
 */
export function naturalSortClients<T extends { name: string }>(clients: T[]): T[] {
  return [...clients].sort((a, b) => naturalCompare(a.name, b.name));
}
