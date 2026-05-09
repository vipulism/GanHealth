import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios';
import type { Request, Response } from 'express';

/** Headers that must not be copied verbatim to the upstream request. */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

type RequestWithRequestId = Request & { requestId?: string };

/**
 * Forwards HTTP requests to upstream Nest services with timeouts, header hygiene, and `x-request-id` propagation.
 */
@Injectable()
export class UpstreamProxyService {
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.timeoutMs = this.config.get<number>('UPSTREAM_TIMEOUT_MS') ?? 30_000;
  }

  /**
   * Proxies the incoming request to an upstream base URL, preserving method, path, query, and JSON body.
   *
   * @param req - Express request (expects `requestId` from {@link RequestIdMiddleware} when set).
   * @param res - Express response to write the upstream result into.
   * @param upstreamBase - Origin only (e.g. `http://user-service:3000`).
   * @throws InternalServerErrorException on unexpected proxy failures (after sending response when possible).
   */
  async forward(
    req: RequestWithRequestId,
    res: Response,
    upstreamBase: string,
  ): Promise<void> {
    const base = upstreamBase.replace(/\/$/, '');
    const targetUrl = `${base}${req.originalUrl}`;

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      const lower = key.toLowerCase();
      if (HOP_BY_HOP_HEADERS.has(lower)) continue;
      headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
    if (req.requestId) {
      headers['x-request-id'] = String(req.requestId);
    }

    const method = req.method.toUpperCase() as Method;
    const axiosConfig: AxiosRequestConfig = {
      method,
      url: targetUrl,
      headers,
      timeout: this.timeoutMs,
      validateStatus: () => true,
      responseType: 'arraybuffer',
    };

    if (method !== 'GET' && method !== 'HEAD' && req.body !== undefined) {
      axiosConfig.data = req.body;
    }

    try {
      const upstream = await axios.request<ArrayBuffer>(axiosConfig);
      res.status(upstream.status);
      for (const [key, value] of Object.entries(upstream.headers)) {
        if (value === undefined) continue;
        const lower = key.toLowerCase();
        if (lower === 'transfer-encoding' || lower === 'connection') continue;
        const v = value;
        if (Array.isArray(v)) {
          res.setHeader(key, v);
        } else if (v !== undefined) {
          res.setHeader(key, v);
        }
      }
      if (req.requestId) {
        res.setHeader('x-request-id', req.requestId);
      }
      res.send(Buffer.from(upstream.data));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        this.sendAxiosProxyFailure(err, res, req);
        return;
      }
      throw new InternalServerErrorException('Upstream proxy failed');
    }
  }

  private sendAxiosProxyFailure(
    err: AxiosError,
    res: Response,
    req: RequestWithRequestId,
  ): void {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      res.status(504).json({
        success: false,
        statusCode: 504,
        message: 'Upstream request timed out',
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (err.response) {
      res.status(err.response.status);
      const data = err.response.data;
      if (Buffer.isBuffer(data)) {
        res.send(data);
      } else if (typeof data === 'string') {
        res.send(data);
      } else {
        res.json(data as object);
      }
      return;
    }
    const nodeEnv = this.config.get<string>('NODE_ENV') ?? 'development';
    const body: Record<string, unknown> = {
      success: false,
      statusCode: 502,
      message: 'Bad gateway',
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    };
    if (nodeEnv !== 'production' && err.code) {
      body.upstreamErrorCode = err.code;
      if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        body.hint =
          'Upstream host did not resolve (e.g. Docker-only hostname like user-service while the gateway runs on the host). Use USER_SERVICE_URL=http://127.0.0.1:3000 for local dev.';
      } else if (err.code === 'ECONNREFUSED') {
        body.hint =
          'Upstream refused the connection. Ensure user-service is running and the port in USER_SERVICE_URL matches.';
      }
    }
    res.status(502).json(body);
  }
}
