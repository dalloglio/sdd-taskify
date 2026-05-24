type PerformanceMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement';
};

const SLOW_RESOURCE_MS = 500;
const SLOW_NAVIGATION_MS = 2500;

const subscribers = new Set<(metric: PerformanceMetric) => void>();
let initialized = false;

function publish(metric: PerformanceMetric) {
  subscribers.forEach((subscriber) => subscriber(metric));

  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    // eslint-disable-next-line no-console
    console.info('[performance]', metric);
  }
}

function ratingFor(
  value: number,
  threshold: number
): PerformanceMetric['rating'] {
  return value <= threshold ? 'good' : 'needs-improvement';
}

export function reportPerformanceMetric(
  metric: Omit<PerformanceMetric, 'rating'>,
  threshold: number
) {
  publish({
    ...metric,
    rating: ratingFor(metric.value, threshold),
  });
}

export function subscribeToPerformanceMetrics(
  subscriber: (metric: PerformanceMetric) => void
) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function initPerformanceMonitoring() {
  if (
    initialized ||
    typeof window === 'undefined' ||
    !('PerformanceObserver' in window)
  ) {
    return;
  }

  initialized = true;

  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (navigation) {
    reportPerformanceMetric(
      { name: 'app:navigation', value: navigation.duration },
      SLOW_NAVIGATION_MS
    );
  }

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.duration > SLOW_RESOURCE_MS) {
        reportPerformanceMetric(
          { name: `resource:${entry.name}`, value: entry.duration },
          SLOW_RESOURCE_MS
        );
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}
