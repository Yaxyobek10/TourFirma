export function buildFilters(query: any) {
  const filters: any = {};
  if (query.isVerified !== undefined) {
    filters.isVerified = query.isVerified === 'true';
  }
  if (query.companyName) {
    filters.companyName = query.companyName;
  }
  return filters;
}
