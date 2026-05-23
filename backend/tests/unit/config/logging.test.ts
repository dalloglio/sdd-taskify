describe('logger', () => {
  const originalEnv = process.env;
  const consoleLog = jest.spyOn(console, 'log').mockImplementation();
  const consoleError = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    consoleLog.mockClear();
    consoleError.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it('writes structured info logs when enabled', async () => {
    process.env.LOG_LEVEL = 'debug';
    const { logger } = await import('../../../src/config/logging');

    logger.info('backend ready', { port: 3000 });

    expect(consoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"message":"backend ready"')
    );
    expect(consoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"meta":{"port":3000}')
    );
  });

  it('suppresses lower-priority logs and writes errors to stderr', async () => {
    process.env.LOG_LEVEL = 'error';
    const { logger } = await import('../../../src/config/logging');

    logger.info('hidden');
    logger.error('db failed');

    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('"message":"db failed"')
    );
  });
});
