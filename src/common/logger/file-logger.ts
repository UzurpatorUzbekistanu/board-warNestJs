import { Logger, LogLevel } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class FileLogger extends Logger {
  private static stream = FileLogger.createStream();

  static setLogLevels(levels: LogLevel[]) {
    Logger.overrideLogger(levels);
  }

  private static createStream() {
    const logsDir = join(process.cwd(), 'logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    return createWriteStream(join(logsDir, 'app.log'), { flags: 'a' });
  }

  private write(level: string, message: any, context?: string, trace?: string) {
    const ts = new Date().toISOString();
    const ctx = context ?? this.context;
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    const line = `[${ts}] [${level}]${ctx ? ` [${ctx}]` : ''} ${msg}${trace ? `\n${trace}` : ''}\n`;
    FileLogger.stream.write(line);
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.write('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.write('ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.write('WARN', message, context);
  }

  debug(message: any, context?: string) {
    super.debug?.(message, context);
    this.write('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    super.verbose?.(message, context);
    this.write('VERBOSE', message, context);
  }
}
