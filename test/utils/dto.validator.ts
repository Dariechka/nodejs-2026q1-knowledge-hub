import { validate } from 'class-validator';
import { type ClassConstructor, plainToInstance } from 'class-transformer';
import type { ValidationError } from '@nestjs/common';

export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  payload: object,
): Promise<ValidationError[]> {
  const instance = plainToInstance(dtoClass, payload);
  return await validate(instance);
}
