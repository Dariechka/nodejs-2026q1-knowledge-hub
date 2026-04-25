import { plainToInstance } from 'class-transformer';

export function convertDto<T>(
  dtoClass: new (...args: any[]) => T,
  payload: object,
): T {
  return plainToInstance(dtoClass, payload);
}
