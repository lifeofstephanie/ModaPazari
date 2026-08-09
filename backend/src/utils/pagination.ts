import { Request } from "express";

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

/** Parse ?page & ?limit with sane bounds. */
export const getPagination = (req: Request): Pagination => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

export const paginated = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
) => ({
  items,
  total,
  page,
  pages: Math.max(1, Math.ceil(total / limit)),
});
