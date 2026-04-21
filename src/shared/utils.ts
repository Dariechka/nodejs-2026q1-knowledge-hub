import { Sorting } from './dto/sorting';
import { Pagination } from './dto/pagination';

export const isProd = process.env.NODE_ENV === 'production';

export const sort = <T>(items: Array<T>, sorting: Sorting): Array<T> => {
  if (sorting.sortBy === undefined || sorting.order === undefined) {
    return items;
  }
  return items.sort((a, b) => {
    switch (sorting.order) {
      case 'asc': {
        return a[sorting.sortBy] - b[sorting.sortBy];
      }
      case 'desc': {
        return b[sorting.sortBy] - a[sorting.sortBy];
      }
    }
  });
};

export const paginate = <T>(
  items: Array<T>,
  pagination: Pagination,
): Array<T> => {
  if (pagination.page === undefined || pagination.limit === undefined) {
    return items;
  }
  const page = pagination.page;
  const limit = pagination.limit;
  return items.slice(page * limit, page * limit + limit);
};

export const toPrismaPagination = (
  pagination: Pagination,
): { skip?: number; take?: number } => {
  if (pagination.page === undefined || pagination.limit === undefined) {
    return {};
  }
  const page = pagination.page;
  const limit = pagination.limit;
  return {
    skip: page * limit,
    take: limit,
  };
};

export const toPrismaSorting = (
  sorting: Sorting,
): { orderBy?: { [key: string]: 'asc' | 'desc' } } => {
  if (sorting.sortBy === undefined || sorting.order === undefined) {
    return {};
  }
  const sortBy = sorting.sortBy;
  const order = sorting.order;
  return {
    orderBy: {
      [sortBy]: order,
    },
  };
};

type AnyObject = Record<string, any>;

const SENSITIVE_KEYS = ['password', 'token'];

const isSensitiveKey = (key: string): boolean => {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((k) => lower.includes(k));
};

export const sanitize = <T = any>(input: T): T => {
  if (Array.isArray(input)) {
    return input.map((item) => sanitize(item)) as any;
  }

  if (input !== null && typeof input === 'object') {
    const result: AnyObject = {};

    for (const [key, value] of Object.entries(input)) {
      if (isSensitiveKey(key)) {
        result[key] = '[REDACTED]';
        continue;
      }

      result[key] = sanitize(value);
    }

    return result as T;
  }

  return input;
};
