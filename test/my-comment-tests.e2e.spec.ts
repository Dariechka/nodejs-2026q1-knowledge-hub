import { request } from './lib';
import { articlesRoutes, commentsRoutes } from './endpoints';
import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';
import {
  getTokenAndUserId,
  removeTokenUser,
  shouldAuthorizationBeTested,
} from './utils';

describe('Additional Comment tests', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  let mockUserId: string | undefined;
  let testArticleId: string;

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      const result = await getTokenAndUserId(unauthorizedRequest);
      commonHeaders['Authorization'] = result.token;
      mockUserId = result.mockUserId;
    }
    const createArticleResponse = await request
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send({
        title: 'ARTICLE_FOR_ADDITIONAL_COMMENTS',
        content: 'Content for extra comment tests',
        status: 'draft',
        authorId: null,
        categoryId: null,
        tags: [],
      });

    expect(createArticleResponse.status).toBe(StatusCodes.CREATED);
    testArticleId = createArticleResponse.body.id;
  });

  afterAll(async () => {
    if (mockUserId) {
      await removeTokenUser(unauthorizedRequest, mockUserId, commonHeaders);
    }

    if (commonHeaders['Authorization']) {
      delete commonHeaders['Authorization'];
    }

    if (testArticleId) {
      await unauthorizedRequest
        .delete(articlesRoutes.delete(testArticleId))
        .set(commonHeaders);
    }
  });

  it('should create, get, and delete a comment', async () => {
    const createArticleResponse = await unauthorizedRequest
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send({
        title: 'TEST_ARTICLE_FOR_FULL_CRUD',
        content: 'Test content',
        status: 'draft',
        authorId: null,
        categoryId: null,
        tags: [],
      });

    expect(createArticleResponse.status).toBe(StatusCodes.CREATED);
    const testArticleId = createArticleResponse.body.id;
    expect(validate(testArticleId)).toBe(true);

    const createCommentDto = {
      content: 'Full lifecycle comment',
      articleId: testArticleId,
      authorId: null,
    };

    const createCommentResponse = await unauthorizedRequest
      .post(commentsRoutes.create)
      .set(commonHeaders)
      .send(createCommentDto);

    expect(createCommentResponse.status).toBe(StatusCodes.CREATED);

    const {
      id: commentId,
      content,
      articleId,
      authorId,
      createdAt,
    } = createCommentResponse.body;

    expect(validate(commentId)).toBe(true);
    expect(content).toBe(createCommentDto.content);
    expect(articleId).toBe(testArticleId);
    expect(authorId).toBeNull();
    expect(typeof createdAt).toBe('number');

    const getResponse = await unauthorizedRequest
      .get(commentsRoutes.getById(commentId))
      .set(commonHeaders);
    expect(getResponse.status).toBe(StatusCodes.OK);
    expect(getResponse.body.id).toBe(commentId);

    const deleteResponse = await unauthorizedRequest
      .delete(commentsRoutes.delete(commentId))
      .set(commonHeaders);
    expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);

    const verifyResponse = await unauthorizedRequest
      .get(commentsRoutes.getById(commentId))
      .set(commonHeaders);
    expect(verifyResponse.status).toBe(StatusCodes.NOT_FOUND);

    const cleanupArticle = await unauthorizedRequest
      .delete(articlesRoutes.delete(testArticleId))
      .set(commonHeaders);
    expect(cleanupArticle.status).toBe(StatusCodes.NO_CONTENT);
  });
});
