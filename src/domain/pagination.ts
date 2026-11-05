export function paginate<T>(items: readonly T[], requestedPage: number, size: number) {
  if (!Number.isInteger(size) || size < 1) throw new RangeError('Page size must be a positive integer');
  const total = Math.ceil(items.length / size);
  const page = Math.min(Math.max(0, Math.trunc(requestedPage) || 0), Math.max(0, total - 1));
  return { page, total, items: items.slice(page * size, (page + 1) * size), start: page * size };
}
