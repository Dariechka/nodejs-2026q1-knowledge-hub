import { describe, it, expect } from 'vitest';
import {
  ParseUUIDPipe,
  BadRequestException,
  type ArgumentMetadata,
} from '@nestjs/common';

describe('ParseUUIDPipe', () => {
  const pipe = new ParseUUIDPipe({ version: '4' });

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: String,
    data: 'id',
  };

  it('should pass with valid UUID v4', async () => {
    const value = '8eb06554-a637-48d6-8aac-f95807841667';
    const result = await pipe.transform(value, metadata);
    expect(result).toBe(value);
  });

  it('should throw for invalid UUID', async () => {
    await expect(pipe.transform('not-a-uuid', metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw for empty string', async () => {
    await expect(pipe.transform('', metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should fail for non-v4 UUID when version is restricted', async () => {
    const pipe = new ParseUUIDPipe({ version: '4' });
    const v1uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    await expect(pipe.transform(v1uuid, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
