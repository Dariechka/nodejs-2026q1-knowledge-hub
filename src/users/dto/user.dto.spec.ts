import { describe, it, expect } from 'vitest';
import { UserDto } from './user.dto';
import { convertDto } from '../../../test/utils/dto.convert';

describe('UserDto', () => {
  it('should create a UserDto instance correctly', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    const dto = new UserDto({
      id: '1',
      login: 'john456',
      role: 'editor',
      password: 'secret',
      createdAt: date,
      updatedAt: date,
    });

    expect(dto.id).toBe('1');
    expect(dto.login).toBe('john456');
    expect(dto.role).toBe('editor');
    expect(dto.password).toBe('secret');
    expect(dto.createdAt).toEqual(date);
    expect(dto.updatedAt).toEqual(date);
  });

  it('should transform dates to timestamp with class-transformer', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    const plain = {
      id: '1',
      login: 'john456',
      role: 'editor',
      password: 'secret',
      createdAt: date,
      updatedAt: date,
    };

    const dto = convertDto(UserDto, plain);
    expect(dto.createdAt).toBe(date.getTime());
    expect(dto.updatedAt).toBe(date.getTime());
  });
});
