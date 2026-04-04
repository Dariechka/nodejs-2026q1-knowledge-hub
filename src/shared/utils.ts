import { Sorting } from './dto/sorting';
import { Pagination } from './dto/pagination';

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
