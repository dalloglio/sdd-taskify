describe('database circuit breaker', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation();

  afterEach(async () => {
    const { dbCircuitBreaker } = await import('../../../src/db/client');
    dbCircuitBreaker.reset();
    consoleError.mockClear();
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it('opens after repeated database failures and rejects new operations', async () => {
    const { dbCircuitBreaker } = await import('../../../src/db/client');
    const failingOperation = jest.fn().mockRejectedValue(new Error('db offline'));

    for (let i = 0; i < 5; i += 1) {
      await expect(dbCircuitBreaker.execute(failingOperation)).rejects.toThrow(
        'db offline'
      );
    }

    await expect(dbCircuitBreaker.execute(jest.fn())).rejects.toThrow(
      'Database temporarily unavailable'
    );
  });

  it('resets after a successful operation', async () => {
    const { dbCircuitBreaker } = await import('../../../src/db/client');

    await expect(
      dbCircuitBreaker.execute(() => Promise.resolve('connected'))
    ).resolves.toBe('connected');

    expect(dbCircuitBreaker.getState()).toBe('closed');
  });
});
