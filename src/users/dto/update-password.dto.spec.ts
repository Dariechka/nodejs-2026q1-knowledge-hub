import { describe, it, expect } from 'vitest';
import { validateDto } from '../../../test/utils/dto.validator';
import { UpdatePasswordDto } from './update-password.dto';

describe('UpdatePasswordDto', () => {
  it('should pass with valid oldPassword and newPassword', async () => {
    const errors = await validateDto(
      UpdatePasswordDto,
      new UpdatePasswordDto({
        oldPassword: 'oldPassword832',
        newPassword: 'newPassword689',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should fail when oldPassword is missing', async () => {
    const errors = await validateDto(
      UpdatePasswordDto,
      new UpdatePasswordDto({
        newPassword: 'newPassword689',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when newPassword is missing', async () => {
    const errors = await validateDto(
      UpdatePasswordDto,
      new UpdatePasswordDto({
        oldPassword: 'oldPassword832',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when oldPassword is empty string', async () => {
    const errors = await validateDto(
      UpdatePasswordDto,
      new UpdatePasswordDto({
        oldPassword: '',
        newPassword: 'newPassword689',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when newPassword is empty string', async () => {
    const errors = await validateDto(
      UpdatePasswordDto,
      new UpdatePasswordDto({
        oldPassword: 'oldPassword832',
        newPassword: '',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
