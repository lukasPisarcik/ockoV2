import type { ZodError } from 'zod';

/**
 * Formats Zod validation errors into a readable string
 */
export function formatZodErrors(error: ZodError): string {
	return error.errors
		.map((err) => {
			const path = err.path.join('.');
			return path ? `${path}: ${err.message}` : err.message;
		})
		.join(', ');
}
