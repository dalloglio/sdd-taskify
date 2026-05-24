import {
  createCorsOptions,
  getAllowedOrigins,
} from '../../../src/config/security';

describe('security configuration', () => {
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  afterEach(() => {
    process.env.CORS_ORIGIN = originalCorsOrigin;
  });

  it('parses comma-separated allowed CORS origins and excludes wildcards', () => {
    process.env.CORS_ORIGIN =
      'http://localhost:5173, https://taskify.example, *';

    expect(getAllowedOrigins()).toEqual([
      'http://localhost:5173',
      'https://taskify.example',
    ]);
  });

  it('rejects origins outside the allowlist', () => {
    process.env.CORS_ORIGIN = 'https://taskify.example';
    const corsOptions = createCorsOptions();
    const callback = jest.fn();

    if (typeof corsOptions.origin !== 'function') {
      throw new Error('Expected function origin policy');
    }

    corsOptions.origin('https://attacker.example', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });
});
