import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { GeminiService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article-dto';
import { SummarizeArticleResponse } from './dto/summarize-article-response-dto';

@ApiTags('ai/articles')
@Controller('ai/articles')
export class AiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly articleService: ArticleService,
  ) {}

  @Post(':articleId/summarize')
  @ApiOperation({ summary: 'Summarize article' })
  @ApiBody({ type: SummarizeArticleDto })
  @ApiResponse({ status: 200, description: 'Summary is created' })
  @ApiResponse({
    status: 404,
    description: 'Article does not exist',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() summarizeDto: SummarizeArticleDto,
  ): Promise<SummarizeArticleResponse> {
    const article = await this.articleService.findOne(articleId);
    const summary = await this.geminiService.fetchSummary(
      article.content,
      summarizeDto.maxLength,
    );

    return {
      articleId: article.id,
      summary,
      originalLength: article.content.length,
      summaryLength: summary.length,
    } satisfies SummarizeArticleResponse;
  }
}
