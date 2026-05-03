import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { GeminiService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article-dto';
import { SummarizeArticleResponseDto } from './dto/summarize-article-response-dto';
import { TranslateArticleDto } from './dto/translate-article-dto';
import { TranslateArticleResponseDto } from './dto/translate-article-response-dto';
import { AnalyzeArticleDto } from './dto/analyze-article-dto';
import { AnalyzeArticleResponseDto } from './dto/analyze-article-response-dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createCacheKey } from '../shared/utils';
import { AiCacheService } from './ai.cash.service';
import { AiMetricsService } from './ai.metrics.service';
import { GeneratePromptDto } from './dto/generate-prompt-dto';

@ApiTags('ai')
@UseGuards(ThrottlerGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly cache: AiCacheService,
    private readonly metrics: AiMetricsService,
    private readonly geminiService: GeminiService,
    private readonly articleService: ArticleService,
  ) {}

  @Post('articles/:articleId/summarize')
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
  ): Promise<SummarizeArticleResponseDto> {
    const article = await this.articleService.findOne(articleId);
    const key = createCacheKey({
      articleId,
      params: summarizeDto,
    });

    const cached = this.cache.get<string>(key);
    if (cached) {
      return {
        articleId: article.id,
        summary: cached,
        originalLength: article.content.length,
        summaryLength: cached.length,
      } satisfies SummarizeArticleResponseDto;
    }

    const summary = await this.geminiService.fetchSummary(
      article.content,
      summarizeDto.maxLength,
    );
    this.cache.set(key, summary);

    return {
      articleId: article.id,
      summary,
      originalLength: article.content.length,
      summaryLength: summary.length,
    } satisfies SummarizeArticleResponseDto;
  }

  @Post('articles/:articleId/translate')
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
  ): Promise<TranslateArticleResponseDto> {
    const article = await this.articleService.findOne(articleId);
    const parameters = Object.keys(translateDto)
      .sort()
      .reduce((acc, key) => {
        acc[key] = translateDto[key];
        return acc;
      }, {});
    const key = createCacheKey({
      articleId,
      params: parameters,
    });
    const cached: TranslateArticleResponseDto = this.cache.get(key);
    if (cached) {
      return {
        articleId: article.id,
        translatedText: cached.translatedText,
        detectedLanguage: cached.detectedLanguage,
      } satisfies TranslateArticleResponseDto;
    }

    const result = await this.geminiService.translateArticle(
      article.content,
      translateDto.targetLanguage,
      translateDto.sourceLanguage,
    );
    this.cache.set(key, result);

    return {
      articleId: article.id,
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage,
    } satisfies TranslateArticleResponseDto;
  }

  @Post('articles/:articleId/analyze')
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
  ): Promise<AnalyzeArticleResponseDto> {
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
    } satisfies AnalyzeArticleResponseDto;
  }

  @Get('usage')
  getUsage() {
    return this.metrics.getStats();
  }

  @Post('generate')
  generate(@Body() dto: GeneratePromptDto): Promise<string> {
    return this.geminiService.generate(dto.prompt);
  }
}
