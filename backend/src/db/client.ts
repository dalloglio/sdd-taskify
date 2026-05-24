import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logging';

const prisma = new PrismaClient();

type CircuitState = 'closed' | 'open' | 'half-open';

const failureThreshold = Number(process.env.DB_CIRCUIT_FAILURE_THRESHOLD || 5);
const resetAfterMs = Number(process.env.DB_CIRCUIT_RESET_MS || 30_000);

class DatabaseCircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private state: CircuitState = 'closed';

  getState() {
    if (this.state === 'open' && Date.now() - this.openedAt >= resetAfterMs) {
      this.state = 'half-open';
    }

    return this.state;
  }

  reset() {
    this.failures = 0;
    this.openedAt = 0;
    this.state = 'closed';
  }

  private recordFailure(error: unknown) {
    this.failures += 1;

    if (this.failures >= failureThreshold) {
      this.state = 'open';
      this.openedAt = Date.now();
      logger.error('Database circuit breaker opened', {
        failures: this.failures,
        resetAfterMs,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.getState();
    if (state === 'open') {
      throw new Error(
        'Database temporarily unavailable. Please try again shortly.'
      );
    }

    try {
      const result = await operation();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
  }
}

export const dbCircuitBreaker = new DatabaseCircuitBreaker();

if (typeof (prisma as any).$use === 'function') {
  (prisma as any).$use(
    (params: unknown, next: (params: unknown) => Promise<unknown>) =>
      dbCircuitBreaker.execute(() => next(params))
  );
}

export async function connectDb() {
  try {
    await dbCircuitBreaker.execute(() => prisma.$connect());
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Prisma connect error', err);
    throw err;
  }
}

export async function disconnectDb() {
  try {
    await prisma.$disconnect();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Prisma disconnect error', err);
  }
}

export default prisma;
