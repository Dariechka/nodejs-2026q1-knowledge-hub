import { usersRoutes } from './endpoints';
import { StatusCodes } from 'http-status-codes';
import { request } from './lib';

describe('Users Additional Tests', () => {
  let mockUserId: string | undefined;
  const commonHeaders = { Accept: 'application/json' };
  const newUserDto = {
    login: 'EXTRA_TEST',
    password: 'EXTRA_PASSWORD',
  };

  it('should reject update if old password is incorrect', async () => {
    const createResponse = await request
      .post(usersRoutes.create)
      .set(commonHeaders)
      .send(newUserDto);

    const { id } = createResponse.body;
    expect(createResponse.statusCode).toBe(StatusCodes.CREATED);

    // Attempt update with wrong old password
    const updateResponse = await request
      .put(usersRoutes.update(id))
      .set(commonHeaders)
      .send({ oldPassword: 'WRONG', newPassword: 'NEW_PASSWORD' });

    expect(updateResponse.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(updateResponse.body.message).toMatch('Old password is incorrect');

    // Cleanup
    const cleanupResponse = await request
      .delete(usersRoutes.delete(id))
      .set(commonHeaders);

    expect(cleanupResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
  });

  it('should create a user, delete it, and then return 404 on get', async () => {
    const createUserDto = {
      login: 'TEMP_USER',
      password: 'TEMP_PASS',
    };

    const createResponse = await request
      .post(usersRoutes.create)
      .set(commonHeaders)
      .send(createUserDto);

    expect(createResponse.status).toBe(StatusCodes.CREATED);
    const { id } = createResponse.body;

    const deleteResponse = await request
      .delete(usersRoutes.delete(id))
      .set(commonHeaders);

    expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);

    const getResponse = await request
      .get(usersRoutes.getById(id))
      .set(commonHeaders);

    expect(getResponse.status).toBe(StatusCodes.NOT_FOUND);
  });
});
