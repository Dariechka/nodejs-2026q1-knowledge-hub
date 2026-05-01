import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { GeminiService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article-dto';
import { SummarizeArticleResponse } from './dto/summarize-article-response-dto';
import { TranslateArticleDto } from './dto/translate-article-dto';
import { TranslateArticleResponse } from './dto/translate-article-response-dto';
import { AnalyzeArticleDto } from './dto/analyze-article-dto';
import { AnalyzeArticleResponse } from './dto/analyze-article-response-dto';

@ApiTags('ai/articles')
@Controller('ai/articles')
export class AiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly articleService: ArticleService,
  ) {}

  @Post(':articleId/summarize')
  @HttpCode(HttpStatus.OK)
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

  @Post(':articleId/translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Translate article content' })
  @ApiBody({ type: TranslateArticleDto })
  @ApiResponse({
    status: 200,
    description: 'Article successfully translated',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or missing targetLanguage',
  })
  async translate(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() translateDto: TranslateArticleDto,
  ): Promise<TranslateArticleResponse> {
    const article = await this.articleService.findOne(articleId);
    const result = await this.geminiService.translateArticle(
      article.content,
      translateDto.targetLanguage,
      translateDto.sourceLanguage,
    );

    return {
      articleId: article.id,
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage,
    } satisfies TranslateArticleResponse;
  }

  @Post(':articleId/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze article' })
  @ApiBody({ type: SummarizeArticleDto })
  @ApiResponse({ status: 200, description: 'Analyze is created' })
  @ApiResponse({
    status: 404,
    description: 'Article does not exist',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  async analyze(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() analyzeDto: AnalyzeArticleDto,
  ): Promise<AnalyzeArticleResponse> {
    const article = await this.articleService.findOne(articleId);
    const result = await this.geminiService.analyzeArticle(
      article.content,
      analyzeDto.task,
    );

    return {
      articleId: article.id,
      analysis: result.analysis,
      suggestions: result.suggestions,
      severity: result.severity,
    } satisfies AnalyzeArticleResponse;
  }
}
