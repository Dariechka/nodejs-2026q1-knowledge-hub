import { request } from './lib';
import { StatusCodes } from 'http-status-codes';
import { articlesRoutes, categoriesRoutes } from './endpoints';

const createArticleDto = {
  title: 'TEMP_ARTICLE',
  content: 'Temporary content',
  status: 'draft',
  authorId: null,
  categoryId: null,
  tags: [],
};

const createCategoryDto = {
  name: 'TEMP_CATEGORY',
  description: 'Temporary category',
};

describe('Additional Article tests', () => {
  const commonHeaders = { Accept: 'application/json' };

  it('should create, delete, and return 404 on fetching deleted article', async () => {
    const createResponse = await request
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send(createArticleDto);

    expect(createResponse.status).toBe(StatusCodes.CREATED);
    const { id } = createResponse.body;

    const deleteResponse = await request
      .delete(articlesRoutes.delete(id))
      .set(commonHeaders);

    expect(deleteResponse.status).toBe(StatusCodes.NO_CONTENT);

    const getResponse = await request
      .get(articlesRoutes.getById(id))
      .set(commonHeaders);

    expect(getResponse.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should create article with category and verify category assignment', async () => {
    const categoryResponse = await request
      .post(categoriesRoutes.create)
      .set(commonHeaders)
      .send(createCategoryDto);

    expect(categoryResponse.status).toBe(StatusCodes.CREATED);
    const { id: categoryId } = categoryResponse.body;

    const articleResponse = await request
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send({ ...createArticleDto, categoryId });

    expect(articleResponse.status).toBe(StatusCodes.CREATED);
    const { id: articleId } = articleResponse.body;

    const getResponse = await request
      .get(articlesRoutes.getById(articleId))
      .set(commonHeaders);

    expect(getResponse.status).toBe(StatusCodes.OK);
    expect(getResponse.body.categoryId).toBe(categoryId);

    // Cleanup
    await request
      .delete(articlesRoutes.delete(articleId))
      .set(commonHeaders);
    await request
      .delete(categoriesRoutes.delete(categoryId))
      .set(commonHeaders);
  });

  it('should correctly handle article with tags', async () => {
    const tags = ['nestjs', 'testing'];
    const articleResponse = await request
      .post(articlesRoutes.create)
      .set(commonHeaders)
      .send({ ...createArticleDto, tags });

    expect(articleResponse.status).toBe(StatusCodes.CREATED);
    const { id: articleId } = articleResponse.body;

    // Fetch article and verify tags
    const getResponse = await request
      .get(articlesRoutes.getById(articleId))
      .set(commonHeaders);

    expect(getResponse.status).toBe(StatusCodes.OK);
    expect(getResponse.body.tags).toEqual(expect.arrayContaining(tags));

    await request
      .delete(articlesRoutes.delete(articleId))
      .set(commonHeaders);
  });
});
