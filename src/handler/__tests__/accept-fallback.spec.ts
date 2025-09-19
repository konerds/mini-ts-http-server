import { writeFileSync } from 'fs';
import { join } from 'path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Handler } from '@handler';
import { ENCODING_UTF_8, MIME_JSON, MIME_TEXT_HTML } from '@http';

import {
  cleanDirTemp,
  createRequest,
  makeDirTemp,
  parseHTTPResponse,
} from './utils';

describe('Accept header & SPA fallback', () => {
  const dirTemp = makeDirTemp();
  const handler = new Handler(dirTemp, console);

  beforeAll(() => {
    writeFileSync(
      join(dirTemp, 'index.html'),
      '<!doctype html><title>Test</title>',
      ENCODING_UTF_8
    );
  });

  afterAll(() => {
    cleanDirTemp(dirTemp);
  });

  it('serves index.html when GET / and Accept: text/html', async () => {
    const { body, headers, status } = parseHTTPResponse(
      await handler.handleSuccess(createRequest('/', MIME_TEXT_HTML))
    );

    expect(status).toBe(200);
    expect(headers['Content-Type']?.startsWith(MIME_TEXT_HTML)).toBe(true);
    expect(body).toContain('<title>Test</title>');
  });

  it('serves index.html on unknown route (no ext) with Accept: text/html', async () => {
    const { headers, status } = parseHTTPResponse(
      await handler.handleSuccess(createRequest('/unknown', MIME_TEXT_HTML))
    );

    expect(status).toBe(200);
    expect(headers['Content-Type']?.startsWith(MIME_TEXT_HTML)).toBe(true);
  });

  it('returns 404 (no SPA) on unknown route when Accept: application/json', async () => {
    expect(
      parseHTTPResponse(
        await handler.handleSuccess(createRequest('/unknown', MIME_JSON))
      ).status
    ).toBe(404);
  });

  it('does not fallback for /api (exact) even if Accept: text/html', async () => {
    expect(
      parseHTTPResponse(
        await handler.handleSuccess(createRequest('/api', MIME_TEXT_HTML))
      ).status
    ).toBe(404);
  });
});
