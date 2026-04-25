import { describe, it, expect } from 'vitest';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';

describe('ValidationPipe', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('should validate correct DTO', async () => {
    const result = await pipe.transform(
      {
        login: 'john',
        password: '123456',
      },
      {
        type: 'body',
        metatype: CreateUserDto,
      },
    );

    expect(result.login).toBe('john');
  });

  it('should throw on invalid DTO', async () => {
    await expect(
      pipe.transform(
        {
          login: '',
        },
        {
          type: 'body',
          metatype: CreateUserDto,
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
