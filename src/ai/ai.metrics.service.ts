import { Injectable } from '@nestjs/common';

type EndpointStats = {
  count: number;
  tokens?: number;
};

export enum AiEndpoint {
  SUMMARIZE = 'summarize',
  TRANSLATE = 'translate',
  ANALYZE = 'analyze',
  GENERATE = 'generate',
}

@Injectable()
export class AiMetricsService {
  private totalRequests = 0;
  private totalTokens = 0;

  private byEndpoint = new Map<AiEndpoint, EndpointStats>();

  track(endpoint: AiEndpoint, tokens?: number) {
    this.totalRequests++;

    if (tokens) {
      this.totalTokens += tokens;
    }

    const current = this.byEndpoint.get(endpoint) || {
      count: 0,
      tokens: 0,
    };

    current.count++;

    if (tokens) {
      current.tokens = (current.tokens || 0) + tokens;
    }

    this.byEndpoint.set(endpoint, current);
  }

  getStats() {
    const endpoints: Record<string, EndpointStats> = {};

    for (const [key, value] of this.byEndpoint.entries()) {
      endpoints[key] = value;
    }
    return {
      totalRequests: this.totalRequests,
      totalTokens: this.totalTokens || undefined,
      endpoints,
      since: new Date(this.startedAt).toISOString(),
    };
  }

  private startedAt = Date.now();
}
