import { validateDto } from '../../../test/utils/dto.validator';
import { AuthDto } from './auth.dto';

describe('AuthDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await validateDto(
      AuthDto,
      new AuthDto({
        login: 'john456',
        password: 'StrongPassword123!',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should fail when login is missing', async () => {
    const errors = await validateDto(
      AuthDto,
      new AuthDto({
        password: 'StrongPassword123!',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when password is missing', async () => {
    const errors = await validateDto(
      AuthDto,
      new AuthDto({
        login: 'john456',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when login is empty', async () => {
    const errors = await validateDto(
      AuthDto,
      new AuthDto({
        login: '',
        password: 'StrongPassword123!',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when password is empty', async () => {
    const errors = await validateDto(
      AuthDto,
      new AuthDto({
        login: 'john456',
        password: '',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
