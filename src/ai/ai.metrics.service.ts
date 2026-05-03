import { Injectable } from '@nestjs/common';

type EndpointStats = {
  count: number;
  tokens?: number;
  cached: number;
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
  private totalCached = 0;

  private byEndpoint = new Map<AiEndpoint, EndpointStats>();

  track(endpoint: AiEndpoint, tokens?: number, cache = false) {
    this.totalRequests++;

    if (tokens) {
      this.totalTokens += tokens;
    }

    const current = this.byEndpoint.get(endpoint) || {
      count: 0,
      tokens: 0,
      cached: 0,
    };

    current.count++;

    if (tokens) {
      current.tokens = (current.tokens || 0) + tokens;
    }

    if (cache) {
      current.cached++;
      this.totalCached++;
    }

    this.byEndpoint.set(endpoint, current);
  }

  private calcRatio(cached: number, total: number) {
    if (total === 0) return 0;
    return Number((cached / total).toFixed(2));
  }

  getStats() {
    const endpoints: Record<string, any> = {};

    for (const [key, value] of this.byEndpoint.entries()) {
      endpoints[key] = {
        ...value,
        cacheHitRatio: this.calcRatio(value.cached, value.count),
      };
    }
    return {
      totalRequests: this.totalRequests,
      totalTokens: this.totalTokens || undefined,
      totalCached: this.totalCached,
      cacheHitRatio: this.calcRatio(this.totalCached, this.totalRequests),
      endpoints,
      since: new Date(this.startedAt).toISOString(),
    };
  }

  private startedAt = Date.now();
}
