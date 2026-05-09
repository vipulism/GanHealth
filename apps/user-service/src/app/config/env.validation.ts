import { z } from 'zod';

/**
 * Zod schema for `ConfigModule` env validation (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`).
 * Unknown keys are preserved for other libraries that read `process.env`.
 */
export const envSchema = z
  .object({
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    PORT: z.string()
      .optional()
      .transform((s) => {
        if (s === undefined || s === '') {
          return 3000;
        }
        const n = Number.parseInt(s, 10);
        if (!Number.isFinite(n) || n < 1) {
          throw new Error('PORT must be a positive integer');
        }
        return n;
      }),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .optional()
      .default('development'),
  })
  .passthrough();

/**
 * Nest `ConfigModule.forRoot({ validate })` hook: parses and validates merged env config.
 *
 * @param config - Raw config from `.env` plus `process.env`
 * @returns Validated config (including unknown keys); coerced `PORT` as a number
 * @throws Error when validation fails
 */
export function validateEnv(config: Record<string, unknown>): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }
  return result.data;
}
