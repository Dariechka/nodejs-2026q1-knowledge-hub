import { Sorting, SortOrder } from './sorting';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('Sorting', () => {
  it('should validate correct dto', async () => {
    const errors = await validate(
      plainToInstance(Sorting, {
        sortBy: 'name',
        order: SortOrder.ASC,
      }),
    );

    expect(errors.length).toBe(0);
  });

  it('should fail when sortBy is set but order is missing', async () => {
    const errors = await validate(
      plainToInstance(Sorting, {
        sortBy: 'name',
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow empty dto', async () => {
    const errors = await validate(plainToInstance(Sorting, {}));

    expect(errors.length).toBe(0);
  });
});
