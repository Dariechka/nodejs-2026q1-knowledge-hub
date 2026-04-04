import { request } from './lib';
import { articlesRoutes, commentsRoutes } from './endpoints';
import { StatusCodes } from 'http-status-codes';
import { validate } from 'uuid';

describe('Additional Comment tests', () => {
  const commonHeaders = { Accept: 'application/json' };
  let testArticleId: string;

  beforeAll(async () => {
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
    if (testArticleId) {
      await request
        .delete(articlesRoutes.delete(testArticleId))
        .set(commonHeaders);
    }
  });

  it('should create, get, and delete a comment', async () => {
    const createArticleResponse = await request
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

    const createCommentResponse = await request
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

    const getResponse = await request
      .get(commentsRoutes.getById(commentId))
      .set(commonHeaders);
    expect(getResponse.status).toBe(StatusCodes.OK);
    expect(getResponse.body.id).toBe(commentId);

    const deleteResponse = await request
      .delete(commentsRoutes.delete(commentId))
      .set(commonHeaders);
    expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);

    const verifyResponse = await request
      .get(commentsRoutes.getById(commentId))
      .set(commonHeaders);
    expect(verifyResponse.status).toBe(StatusCodes.NOT_FOUND);

    const cleanupArticle = await request
      .delete(articlesRoutes.delete(testArticleId))
      .set(commonHeaders);
    expect(cleanupArticle.status).toBe(StatusCodes.NO_CONTENT);
  });
});
