export function getPagination(query: any) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}
