import { validateDto } from '../../../test/utils/dto.validator';
import { CategoryDto } from './category.dto';

describe('CategoryDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        name: 'Technology',
        description: 'Articles related to technology and programming',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should fail when name is missing', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        description: 'Some description',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when description is missing', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        name: 'Technology',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when name is empty', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        name: '',
        description: 'Valid description',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when description is empty', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        name: 'Valid name',
        description: '',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when name is not a string', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        name: 123 as any,
        description: 'Valid description',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail when description is not a string', async () => {
    const errors = await validateDto(
      CategoryDto,
      new CategoryDto({
        name: 'Valid name',
        description: 123 as any,
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
