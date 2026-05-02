import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createSummarizeArticlePrompt } from './prompt/summarization.prompt';
import {
  catchError,
  firstValueFrom,
  map,
  retry,
  throwError,
  timer,
} from 'rxjs';
import { MaxLength } from './dto/summarize-article-dto';
import { translateArticlePrompt } from './prompt/translatearticle.prompt';
import type { Task } from './dto/analyze-article-dto';
import { analyzation } from './prompt/analyzation.prompt';
import { StatusCodes } from 'http-status-codes';
import {
  InternalServerError,
  ServerUnavailableError,
} from '../shared/error/knowledge-hub-errors';
import { AiEndpoint, AiMetricsService } from './ai.metrics.service';

@Injectable()
export class GeminiService {
  private logger = new Logger(GeminiService.name);
  private readonly apiKey: string = process.env.GEMINI_API_KEY;
  private readonly baseUrl: string = process.env.GEMINI_API_BASE_URL;
  private readonly model: string = process.env.GEMINI_MODEL;
  private readonly url: string = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

  constructor(
    private readonly httpService: HttpService,
    private readonly metrics: AiMetricsService,
  ) {}

  async fetchSummary(content: string, maxLength: MaxLength) {
    const prompt = createSummarizeArticlePrompt(content, maxLength);

    const result$ = this.httpService
      .post(this.url, {
        contents: [{ parts: [{ text: prompt }] }],
      })
      .pipe(
        retry({
          count: 3,
          delay: (err, retryCount) => this.delay(err, retryCount),
        }),
        map((res) => {
          const tokens = res.data?.usageMetadata?.totalTokenCount;
          this.metrics.track(AiEndpoint.SUMMARIZE, tokens);
          return res.data.candidates[0].content.parts[0].text;
        }),
        catchError((err) => this.catchError(err)),
      );
    return firstValueFrom(result$);
  }

  async translateArticle(
    content: string,
    targetLanguage: string,
    sourceLanguage?: string,
  ) {
    const prompt = translateArticlePrompt(
      content,
      targetLanguage,
      sourceLanguage,
    );

    const result$ = this.httpService
      .post(this.url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      })
      .pipe(
        retry({
          count: 3,
          delay: (err, retryCount) => this.delay(err, retryCount),
        }),
        map((res) => {
          const tokens = res.data?.usageMetadata?.totalTokenCount;
          this.metrics.track(AiEndpoint.TRANSLATE, tokens);
          return JSON.parse(res.data.candidates[0].content.parts[0].text);
        }),
        catchError((err) => this.catchError(err)),
      );
    return firstValueFrom(result$);
  }

  async analyzeArticle(content: string, task: Task) {
    const prompt = analyzation(content, task);

    const result$ = this.httpService
      .post(this.url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      })
      .pipe(
        retry({
          count: 3,
          delay: (err, retryCount) => this.delay(err, retryCount),
        }),
        map((res) => {
          const tokens = res.data?.usageMetadata?.totalTokenCount;
          this.metrics.track(AiEndpoint.ANALYZE, tokens);
          return JSON.parse(res.data.candidates[0].content.parts[0].text);
        }),
        catchError((err) => this.catchError(err)),
      );
    return firstValueFrom(result$);
  }

  private catchError(err: any) {
    const status = err.status;

    if ([StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].includes(status)) {
      return throwError(() => new InternalServerError());
    }

    if (
      [
        StatusCodes.BAD_GATEWAY,
        StatusCodes.SERVICE_UNAVAILABLE,
        StatusCodes.GATEWAY_TIMEOUT,
      ].includes(status)
    ) {
      return throwError(() => new ServerUnavailableError());
    }

    if ([StatusCodes.TOO_MANY_REQUESTS].includes(status)) {
      return throwError(() => new ServerUnavailableError());
    }

    return throwError(() => {
      this.logger.error('Unknown error: ' + err);
      return new InternalServerError();
    });
  }

  private delay(err: any, retryCount: number) {
    if (err.status !== HttpStatus.TOO_MANY_REQUESTS) {
      throw err;
    }
    const backoffTime = Math.pow(2, retryCount - 1) * 1000;
    this.logger.debug(
      `Attempt ${retryCount} failed. Retrying in ${backoffTime}ms...`,
    );
    return timer(backoffTime);
  }
}
