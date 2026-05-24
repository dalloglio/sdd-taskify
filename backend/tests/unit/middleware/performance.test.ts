import { createRateLimit } from '../../../src/middleware/rateLimit';
import { staticCacheHeaders } from '../../../src/middleware/staticCache';

function createResponse() {
  return {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('performance middleware', () => {
  it('sets immutable cache headers for static assets', () => {
    const res = createResponse();
    const next = jest.fn();

    staticCacheHeaders(
      { method: 'GET', path: '/assets/app.123.js' } as never,
      res as never,
      next
    );

    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    expect(next).toHaveBeenCalled();
  });

  it('does not cache dynamic API responses', () => {
    const res = createResponse();
    const next = jest.fn();

    staticCacheHeaders(
      { method: 'GET', path: '/api/v1/projects' } as never,
      res as never,
      next
    );

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('throttles requests after the configured limit', () => {
    let currentTime = 1_000;
    const middleware = createRateLimit({
      windowMs: 60_000,
      maxRequests: 2,
      keyGenerator: () => 'client-1',
      now: () => currentTime,
    });
    const res = createResponse();
    const next = jest.fn();
    const req = {} as never;

    middleware(req, res as never, next);
    middleware(req, res as never, next);
    middleware(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many requests. Please retry shortly.',
    });

    currentTime += 60_000;
    middleware(req, createResponse() as never, next);
    expect(next).toHaveBeenCalledTimes(3);
  });
});
