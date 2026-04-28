import { validateDto } from '../../../test/utils/dto.validator';
import { RefreshDto } from './refresh.dto';

describe('RefreshDto', () => {
  it('should pass when refreshToken is provided', async () => {
    const errors = await validateDto(
      RefreshDto,
      new RefreshDto({ refreshToken: 'abc123' }),
    );
    expect(errors.length).toBe(0);
  });

  it('should pass when refreshToken is missing (optional)', async () => {
    const errors = await validateDto(RefreshDto, new RefreshDto({}));
    expect(errors.length).toBe(0);
  });
});
