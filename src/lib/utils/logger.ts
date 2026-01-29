import pino from 'pino';

/**
 * Pino logger instance for structured logging
 * Use with context objects: log.info({ initId, data }, 'Message')
 */
export const log = pino({
	level: import.meta.env.DEV ? 'debug' : 'info',
	transport: import.meta.env.DEV
		? {
				target: 'pino-pretty',
				options: {
					colorize: true
				}
			}
		: undefined
});
