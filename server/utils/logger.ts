/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('DEBUG', message, meta));
    }
  }

  info(message: string, meta?: any) {
    console.info(this.format('INFO', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.format('WARN', message, meta));
  }

  error(message: string, error?: any, meta?: any) {
    const combinedMeta = {
      ...(meta || {}),
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    };
    console.error(this.format('ERROR', message, combinedMeta));
  }
}

export const logger = new Logger();
export default logger;
