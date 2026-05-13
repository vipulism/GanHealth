/** Cookie name for the JWT refresh token (HttpOnly). */
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

/**
 * Path scope for the refresh cookie so it is sent only to auth routes under the API version prefix.
 * Must match `setGlobalPrefix('api')` + URI version `v1` + `auth` controller path.
 */
export const REFRESH_TOKEN_COOKIE_PATH = '/api/v1/auth';

/** Browser max-age for the refresh cookie (7 days), aligned with refresh JWT `expiresIn`. */
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
