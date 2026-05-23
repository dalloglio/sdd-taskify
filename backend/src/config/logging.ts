type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const priorities: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();
  if (
    configured === 'debug' ||
    configured === 'info' ||
    configured === 'warn' ||
    configured === 'error'
  ) {
    return configured;
  }

  return process.env.NODE_ENV === 'test' ? 'error' : 'info';
}

function shouldLog(level: LogLevel) {
  return priorities[level] >= priorities[currentLevel()];
}

function write(level: LogLevel, message: string, meta?: unknown) {
  if (!shouldLog(level)) return;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta === undefined ? {} : { meta }),
  };

  const line = JSON.stringify(entry);
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(line);
}

export const logger = {
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};

export default logger;
