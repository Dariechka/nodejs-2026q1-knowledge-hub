import { describe, it, expect } from 'vitest';
import {
  paginate,
  sanitize,
  sort,
  toPrismaPagination,
  toPrismaSorting,
} from './utils';
import { SortOrder } from './dto/sorting';

describe('sort', () => {
  it('should return original array if sortBy is undefined', () => {
    const items = [{ value: 3 }, { value: 1 }];

    const result = sort(items, { sortBy: undefined, order: SortOrder.ASC });

    expect(result).toBe(items);
  });

  it('should return original array if order is undefined', () => {
    const items = [{ value: 3 }, { value: 1 }];

    const result = sort(items, { sortBy: 'value', order: undefined });

    expect(result).toBe(items);
  });

  it('should sort ascending', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];

    const result = sort(items, { sortBy: 'value', order: SortOrder.ASC });

    expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  it('should sort descending', () => {
    const items = [{ value: 1 }, { value: 3 }, { value: 2 }];

    const result = sort(items, { sortBy: 'value', order: SortOrder.DESC });

    expect(result).toEqual([{ value: 3 }, { value: 2 }, { value: 1 }]);
  });

  it('should mutate the original array (important behavior)', () => {
    const items = [{ value: 3 }, { value: 1 }];

    sort(items, { sortBy: 'value', order: SortOrder.ASC });

    expect(items).toEqual([{ value: 1 }, { value: 3 }]);
  });
});

describe('toPrismaPagination', () => {
  it('should return empty object when page is undefined', () => {
    const result = toPrismaPagination({
      page: undefined,
      limit: 10,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when limit is undefined', () => {
    const result = toPrismaPagination({
      page: 1,
      limit: undefined,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when both are undefined', () => {
    const result = toPrismaPagination({
      page: undefined,
      limit: undefined,
    });

    expect(result).toEqual({});
  });

  it('should calculate skip and take correctly', () => {
    const result = toPrismaPagination({
      page: 2,
      limit: 10,
    });

    expect(result).toEqual({
      skip: 20,
      take: 10,
    });
  });

  it('should work with page = 0 (edge case)', () => {
    const result = toPrismaPagination({
      page: 0,
      limit: 10,
    });

    expect(result).toEqual({
      skip: 0,
      take: 10,
    });
  });
});

describe('toPrismaSorting', () => {
  it('should return empty object when sortBy is undefined', () => {
    const result = toPrismaSorting({
      sortBy: undefined,
      order: SortOrder.ASC,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when order is undefined', () => {
    const result = toPrismaSorting({
      sortBy: 'name',
      order: undefined,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when both are undefined', () => {
    const result = toPrismaSorting({
      sortBy: undefined,
      order: undefined,
    });

    expect(result).toEqual({});
  });

  it('should build ascending orderBy object', () => {
    const result = toPrismaSorting({
      sortBy: 'name',
      order: SortOrder.ASC,
    });

    expect(result).toEqual({
      orderBy: {
        name: SortOrder.ASC,
      },
    });
  });

  it('should build descending orderBy object', () => {
    const result = toPrismaSorting({
      sortBy: 'createdAt',
      order: SortOrder.DESC,
    });

    expect(result).toEqual({
      orderBy: {
        createdAt: SortOrder.DESC,
      },
    });
  });

  it('should use dynamic key correctly', () => {
    const result = toPrismaSorting({
      sortBy: 'someField',
      order: SortOrder.ASC,
    });

    expect(result.orderBy).toHaveProperty('someField', 'asc');
  });
});

describe('sanitize', () => {
  it('should redact password field', () => {
    const input = { password: '123456' };

    expect(sanitize(input)).toEqual({
      password: '[REDACTED]',
    });
  });

  it('should redact token field', () => {
    const input = { token: 'abc123' };

    expect(sanitize(input)).toEqual({
      token: '[REDACTED]',
    });
  });

  it('should redact keys containing sensitive keywords', () => {
    const input = {
      userPasswordHash: 'secret',
      accessTokenValue: 'secret',
    };

    expect(sanitize(input)).toEqual({
      userPasswordHash: '[REDACTED]',
      accessTokenValue: '[REDACTED]',
    });
  });

  it('should be case insensitive', () => {
    const input = {
      PASSWORD: '123',
      ToKeN: '456',
    };

    expect(sanitize(input)).toEqual({
      PASSWORD: '[REDACTED]',
      ToKeN: '[REDACTED]',
    });
  });

  it('should sanitize nested objects', () => {
    const input = {
      user: {
        password: '123',
        profile: {
          token: 'abc',
        },
      },
    };

    expect(sanitize(input)).toEqual({
      user: {
        password: '[REDACTED]',
        profile: {
          token: '[REDACTED]',
        },
      },
    });
  });

  it('should sanitize arrays of objects', () => {
    const input = [{ password: '1' }, { token: '2' }];

    expect(sanitize(input)).toEqual([
      { password: '[REDACTED]' },
      { token: '[REDACTED]' },
    ]);
  });

  it('should preserve primitive values', () => {
    expect(sanitize('hello')).toBe('hello');
    expect(sanitize(123)).toBe(123);
    expect(sanitize(null)).toBe(null);
    expect(sanitize(true)).toBe(true);
  });

  it('should not mutate original object', () => {
    const input = {
      password: 'secret',
      nested: { token: 'abc' },
    };

    const copy = structuredClone(input);

    sanitize(input);

    expect(input).toEqual(copy);
  });
});

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6];

  it('should return original array when page is undefined', () => {
    const result = paginate(items, {
      page: undefined,
      limit: 2,
    });

    expect(result).toBe(items);
  });

  it('should return original array when limit is undefined', () => {
    const result = paginate(items, {
      page: 1,
      limit: undefined,
    });

    expect(result).toBe(items);
  });

  it('should paginate correctly (page 0)', () => {
    const result = paginate(items, {
      page: 0,
      limit: 2,
    });

    expect(result).toEqual([1, 2]);
  });

  it('should paginate correctly (page 1)', () => {
    const result = paginate(items, {
      page: 1,
      limit: 2,
    });

    expect(result).toEqual([3, 4]);
  });

  it('should paginate correctly (last page partial)', () => {
    const result = paginate(items, {
      page: 2,
      limit: 2,
    });

    expect(result).toEqual([5, 6]);
  });

  it('should return empty array when page is out of range', () => {
    const result = paginate(items, {
      page: 10,
      limit: 2,
    });

    expect(result).toEqual([]);
  });

  it('should not mutate original array', () => {
    const copy = [...items];

    paginate(items, {
      page: 1,
      limit: 2,
    });

    expect(items).toEqual(copy);
  });
});
