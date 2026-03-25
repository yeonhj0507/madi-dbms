import pino from 'pino';
import { env } from './env';

/**
 * Application logger using Pino
 */

const logger = pino({
  level: env.IS_PRODUCTION ? 'info' : 'debug',
  transport: env.IS_DEVELOPMENT
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export default logger;

/**
 * Log an API request
 */
export function logRequest(
  method: string,
  path: string,
  context?: Record<string, unknown>
) {
  logger.info({ method, path, ...context }, 'API Request');
}

/**
 * Log an API error
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  logger.error(
    {
      error: {
        message: errorObj.message,
        stack: errorObj.stack,
        name: errorObj.name,
      },
      ...context,
    },
    'API Error'
  );
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: Record<string, unknown>) {
  logger.warn({ ...context }, message);
}
