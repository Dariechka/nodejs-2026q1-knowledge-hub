import { Injectable, Logger } from '@nestjs/common';
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
  TooManyRequestError,
} from '../shared/error/knowledge-hub-errors';

@Injectable()
export class GeminiService {
  private logger = new Logger(GeminiService.name);
  private readonly apiKey: string = process.env.GEMINI_API_KEY;
  private readonly baseUrl: string = process.env.GEMINI_API_BASE_URL;
  private readonly model: string = process.env.GEMINI_MODEL;
  private readonly url: string = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

  constructor(private readonly httpService: HttpService) {}

  async fetchSummary(content: string, maxLength: MaxLength) {
    const prompt = createSummarizeArticlePrompt(content, maxLength);

    const result$ = this.httpService
      .post(this.url, {
        contents: [{ parts: [{ text: prompt }] }],
      })
      .pipe(
        retry({
          count: 3,
          delay: (_, retryCount) => {
            const backoffTime = Math.pow(2, retryCount - 1) * 1000;
            this.logger.debug(
              `Attempt ${retryCount} failed. Retrying in ${backoffTime}ms...`,
            );
            return timer(backoffTime);
          },
        }),
        map((res) => res.data.candidates[0].content.parts[0].text),
        catchError((err) => {
          const status = err.status;

          if (
            [StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].includes(status)
          ) {
            this.logger.error('Gemini Auth Error: Check your API Key.', err);
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

          return throwError(() => new InternalServerError());
        }),
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
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.url, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      );
      const rawContent = response.data.candidates[0].content.parts[0].text;
      const cleanJson = rawContent.replace(/```json|```/g, '').trim();
      console.log(cleanJson);
      return JSON.parse(cleanJson);
    } catch (error) {
      this.logger.error(
        'Gemini Error: ' +
          (JSON.stringify(error.response?.data) + ' ' + error.message),
        error,
      );
      throw error;
    }
  }

  async analyzeArticle(content: string, task: Task) {
    const prompt = analyzation(content, task);
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.url, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      );

      const rawText = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText);
    } catch (error) {
      this.logger.error(
        'Gemini Error: ' + (error.response?.data || error.message),
        error,
      );
    }
  }
}
