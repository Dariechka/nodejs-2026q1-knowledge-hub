import { describe, it, expect } from 'vitest';
import { validateDto } from '../../../test/utils/dto.validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should pass with valid payload and role', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        login: 'john456',
        password: 'StrongPassword123!',
        role: 'editor',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should pass with valid payload without role', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        login: 'john456',
        password: 'StrongPassword123!',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should fail when login is missing', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        password: 'StrongPassword123!',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when password is missing', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        login: 'john456',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when role is invalid', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        login: 'john456',
        password: 'StrongPassword123!',
        role: 'superadmin' as any,
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should fail when login is empty string', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        login: '',
        password: 'StrongPassword123!',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when password is empty string', async () => {
    const errors = await validateDto(
      CreateUserDto,
      new CreateUserDto({
        login: 'john456',
        password: '',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
