import { request } from './lib';
import { StatusCodes } from 'http-status-codes';
import { categoriesRoutes, articlesRoutes } from './endpoints';

const createCategoryDto = {
  name: 'TEMP_CATEGORY',
  description: 'Temporary category description',
};

describe('Additional Category tests', () => {
  const commonHeaders = { Accept: 'application/json' };

  it('should create, delete, and return 404 on fetching deleted category', async () => {
    const createResponse = await request
      .post(categoriesRoutes.create)
      .set(commonHeaders)
      .send(createCategoryDto);

    expect(createResponse.status).toBe(StatusCodes.CREATED);
    const { id } = createResponse.body;

    const deleteResponse = await request
      .delete(categoriesRoutes.delete(id))
      .set(commonHeaders);

    expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);

    const getResponse = await request
      .get(categoriesRoutes.getById(id))
      .set(commonHeaders);

    expect(getResponse.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should set categoryId to null for all articles when category is deleted', async () => {
    const categoryResponse = await request
      .post(categoriesRoutes.create)
      .set(commonHeaders)
      .send(createCategoryDto);

    const { id: categoryId } = categoryResponse.body;

    const createArticleDto = {
      title: 'TEMP_ARTICLE',
      content: 'Test content',
      status: 'draft',
      authorId: null,
      categoryId,
      tags: [],
    };

    const articleResponse = await request
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send(createArticleDto);

    const { id: articleId } = articleResponse.body;

    // Delete category
    await request
      .delete(categoriesRoutes.delete(categoryId))
      .set(commonHeaders);

    // Fetch article and verify categoryId is null
    const getArticleResponse = await request
      .get(articlesRoutes.getById(articleId))
      .set(commonHeaders);

    expect(getArticleResponse.status).toBe(StatusCodes.OK);
    expect(getArticleResponse.body.categoryId).toBeNull();

    // Cleanup article
    await request
      .delete(articlesRoutes.delete(articleId))
      .set(commonHeaders);
  });
});
