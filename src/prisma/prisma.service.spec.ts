import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();

    vi.spyOn(service, '$connect').mockResolvedValue(undefined);
    vi.spyOn(service, '$disconnect').mockResolvedValue(undefined);
  });

  it('should call $connect on module init', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
