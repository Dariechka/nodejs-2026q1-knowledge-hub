import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServerUnavailableError } from '../shared/error/knowledge-hub-errors';

@Injectable()
export class GeminiRagService {
  private readonly apiKey: string = process.env.GEMINI_API_KEY;
  private readonly baseUrl: string = process.env.GEMINI_API_BASE_URL;
  private readonly model: string = process.env.GEMINI_MODEL;
  private readonly url: string = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
  private readonly defaultEmbeddingModel: string =
    process.env.GEMINI_EMBEDDING_MODEL ?? 'text-embedding-004';

  constructor(private readonly httpService: HttpService) {}

  async fetchEmbeddings(text: string): Promise<Array<number>> {
    let result: Array<number>;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.url, {
          model: `models/${this.defaultEmbeddingModel}`,
          content: { parts: [{ text }] },
        }),
      );

      if (data?.embedding?.values) {
        result = data.embedding.values;
      }
    } catch (error) {
      console.error(error);
      throw new ServerUnavailableError(
        'Failed to generate embeddings ' + error,
      );
    }

    if (result) {
      return result;
    } else {
      throw new ServerUnavailableError('Embeddings were empty');
    }
  }

  async generateAnswer(prompt: string): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.url, {
          contents: [{ parts: [{ text: prompt }] }],
        }),
      );

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new ServerUnavailableError(
        'Failed to generate embeddings ' + error,
      );
    }
  }
}
