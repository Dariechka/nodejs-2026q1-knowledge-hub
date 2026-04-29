import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createSummarizeArticlePrompt } from './summarization.prompt';
import { firstValueFrom } from 'rxjs';
import { MaxLength } from './dto/summarize-article-dto';

@Injectable()
export class GeminiService {
  private logger = new Logger(GeminiService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchSummary(content: string, maxLength: MaxLength) {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = process.env.GEMINI_API_BASE_URL;
    const model = process.env.GEMINI_MODEL;

    const url = `${baseUrl}/${model}:generateContent?key=${apiKey}`;
    const prompt = createSummarizeArticlePrompt(content, maxLength);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, {
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
}
