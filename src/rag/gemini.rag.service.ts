import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServerUnavailableError } from '../shared/error/knowledge-hub-errors';

@Injectable()
export class GeminiRagService {
  private readonly apiKey: string = process.env.GEMINI_API_KEY;
  private readonly baseUrl: string = process.env.GEMINI_API_BASE_URL;
  private readonly model: string = process.env.GEMINI_MODEL;
  private readonly embeddingModel: string =
    process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-2';
  private readonly embeddingModelUrl: string = `${this.baseUrl}/${this.embeddingModel}:embedContent?key=${this.apiKey}`;
  private readonly modelUrl: string = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

  constructor(private readonly httpService: HttpService) {}

  async fetchEmbeddings(text: string): Promise<Array<number>> {
    let result: Array<number>;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(this.embeddingModelUrl, {
          output_dimensionality: 768,
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
        this.httpService.post(this.modelUrl, {
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
