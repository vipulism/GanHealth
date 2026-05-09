import { z } from 'zod';

/**
 * Zod schema for api-gateway `ConfigModule` env: upstream URLs, JWT, timeouts, CORS.
 * Unknown keys are preserved for other libraries that read `process.env`.
 */
export const envSchema = z
  .object({
    JWT_SECRET: z.string().min(32),
    USER_SERVICE_URL: z.url(),
    SECOND_SERVICE_URL: z.url(),
    GATEWAY_PORT: z
      .string()
      .optional()
      .transform((s) => {
        if (s === undefined || s === '') {
          return 3100;
        }
        const n = Number.parseInt(s, 10);
        if (!Number.isFinite(n) || n < 1) {
          throw new Error('GATEWAY_PORT must be a positive integer');
        }
        return n;
      }),
    UPSTREAM_TIMEOUT_MS: z
      .string()
      .optional()
      .transform((s) => {
        if (s === undefined || s === '') {
          return 30_000;
        }
        const n = Number.parseInt(s, 10);
        if (!Number.isFinite(n) || n < 1) {
          throw new Error('UPSTREAM_TIMEOUT_MS must be a positive integer');
        }
        return n;
      }),
    CORS_ORIGIN: z.string().optional(),
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
 * @returns Validated config (including unknown keys); coerced `GATEWAY_PORT` and timeouts as numbers
 * @throws Error when validation fails
 */
export function validateEnv(
  config: Record<string, unknown>,
): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }
  return result.data;
}
