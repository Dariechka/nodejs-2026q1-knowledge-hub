import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createSummarizeArticlePrompt } from './prompt/summarization.prompt';
import { firstValueFrom } from 'rxjs';
import { MaxLength } from './dto/summarize-article-dto';
import { translateArticlePrompt } from './prompt/translatearticle.prompt';

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

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.url, {
          contents: [{ parts: [{ text: prompt }] }],
        }),
      );

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      this.logger.error(
        'Gemini Error: ' + (error.response?.data || error.message),
        error,
      );
    }
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
      return JSON.parse(cleanJson);
    } catch (error) {
      this.logger.error(
        'Gemini Error: ' + (error.response?.data || error.message),
        error,
      );
    }
  }
}
