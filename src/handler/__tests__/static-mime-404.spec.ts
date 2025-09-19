import { writeFileSync } from 'fs';
import { join } from 'path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Handler } from '@handler';
import {
  MIME_CSS,
  MIME_IMAGE_JPEG,
  MIME_TEXT_HTML,
  MIME_TEXT_JAVASCRIPT,
} from '@http';

import {
  cleanDirTemp,
  createRequest,
  makeDirTemp,
  parseHTTPResponse,
} from './utils';

describe('Static serving & MIME & 404', () => {
  const dirTemp = makeDirTemp();
  const handler = new Handler(dirTemp, console);

  beforeAll(() => {
    writeFileSync(join(dirTemp, 'index.html'), '<html></html>', 'utf-8');
    writeFileSync(join(dirTemp, 'index.css'), 'body{}', 'utf-8');
    writeFileSync(join(dirTemp, 'app.js'), 'console.log(1)', 'utf-8');
    writeFileSync(join(dirTemp, 'pic.jpg'), 'fake', 'utf-8');
  });

  afterAll(() => {
    cleanDirTemp(dirTemp);
  });

  it('serves CSS with text/css', async () => {
    const { headers, status } = parseHTTPResponse(
      await handler.handleSuccess(createRequest('/index.css'))
    );

    expect(status).toBe(200);
    expect(headers['Content-Type']!.startsWith(MIME_CSS)).toBe(true);
  });

  it('serves JS with text/javascript', async () => {
    const { headers, status } = parseHTTPResponse(
      await handler.handleSuccess(createRequest('/app.js'))
    );

    expect(status).toBe(200);
    expect(headers['Content-Type']!.startsWith(MIME_TEXT_JAVASCRIPT)).toBe(
      true
    );
  });

  it('serves JPG with image/jpeg', async () => {
    const { headers, status } = parseHTTPResponse(
      await handler.handleSuccess(createRequest('/pic.jpg'))
    );

    expect(status).toBe(200);
    expect(headers['Content-Type']).toBe(MIME_IMAGE_JPEG);
  });

  it('unknown static path with extension returns 404 (no fallback)', async () => {
    expect(
      parseHTTPResponse(
        await handler.handleSuccess(createRequest('/nope.css', MIME_TEXT_HTML))
      ).status
    ).toBe(404);
  });
});
