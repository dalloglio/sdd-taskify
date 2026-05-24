import { describe, expect, it, vi } from 'vitest';
import {
  reportPerformanceMetric,
  subscribeToPerformanceMetrics,
} from '../../../src/config/performance';

describe('performance monitoring', () => {
  it('publishes rated performance metrics to subscribers', () => {
    const subscriber = vi.fn();
    const unsubscribe = subscribeToPerformanceMetrics(subscriber);

    reportPerformanceMetric({ name: 'resource:/assets/app.js', value: 750 }, 500);

    expect(subscriber).toHaveBeenCalledWith({
      name: 'resource:/assets/app.js',
      value: 750,
      rating: 'needs-improvement',
    });

    unsubscribe();
    reportPerformanceMetric({ name: 'resource:/assets/chunk.js', value: 100 }, 500);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});
