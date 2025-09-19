import { buildResponse, C_STATUS_HTTP, type T_REQUEST } from '@http';
import { ENCODING_UTF_8, MIME_JSON } from '@http';

import { getWrappedWithCharset, parseMultipart } from './utils';

const CONTENT_TYPE_JSON_UTF_8 = getWrappedWithCharset(
  MIME_JSON,
  ENCODING_UTF_8
);

function handleGet(path: string, req: T_REQUEST) {
  let body;

  if (path === '/ping') {
    body = JSON.stringify({ method: req.method, ok: true });
  }

  if (!body) {
    return null;
  }

  return buildResponse(
    C_STATUS_HTTP.OK,
    {
      Connection: 'close',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': CONTENT_TYPE_JSON_UTF_8,
    },
    body
  );
}

function handlePost(path: string, req: T_REQUEST) {
  let bodyRequest = req.body?.toString(ENCODING_UTF_8) ?? '';
  const contentType = (req.headers['content-type'] || '').toLowerCase();

  if (contentType.includes('multipart/form-data')) {
    const parsed = parseMultipart(contentType, req.body || Buffer.alloc(0));

    if (!parsed) {
      const body = JSON.stringify({
        error: 'Invalid multipart/form-data',
        ok: false,
      });

      return buildResponse(
        C_STATUS_HTTP.BAD_REQUEST,
        {
          Connection: 'close',
          'Content-Length': String(Buffer.byteLength(body)),
          'Content-Type': CONTENT_TYPE_JSON_UTF_8,
        },
        body
      );
    }

    if (path === '/echo') {
      const body = JSON.stringify({
        fields: parsed.fields,
        files: parsed.files,
        ok: true,
      });

      return buildResponse(
        C_STATUS_HTTP.OK,
        {
          Connection: 'close',
          'Content-Length': String(Buffer.byteLength(body)),
          'Content-Type': CONTENT_TYPE_JSON_UTF_8,
        },
        body
      );
    }
  }

  if (contentType.includes(MIME_JSON)) {
    try {
      bodyRequest = JSON.parse(bodyRequest || '{}');
    } catch {
      // ignore
    }
  }

  let body;

  if (path === '/echo') {
    body = JSON.stringify(
      { bodyRequest, method: req.method, ok: true },
      null,
      2
    );
  }

  if (!body) {
    return null;
  }

  return buildResponse(
    C_STATUS_HTTP.OK,
    {
      Connection: 'close',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': CONTENT_TYPE_JSON_UTF_8,
    },
    body
  );
}

function handlePut(path: string, req: T_REQUEST) {
  let bodyRequest = req.body?.toString(ENCODING_UTF_8) ?? '';

  if ((req.headers['content-type'] || '').toLowerCase().includes(MIME_JSON)) {
    try {
      bodyRequest = JSON.parse(bodyRequest || '{}');
    } catch {
      // ignore
    }
  }

  let body;

  if (path === '/echo') {
    body = JSON.stringify(
      { bodyRequest, method: req.method, ok: true },
      null,
      2
    );
  }

  if (!body) {
    return null;
  }

  return buildResponse(
    C_STATUS_HTTP.OK,
    {
      Connection: 'close',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': CONTENT_TYPE_JSON_UTF_8,
    },
    body
  );
}

function handlePatch(path: string, req: T_REQUEST) {
  let bodyRequest = req.body?.toString(ENCODING_UTF_8) ?? '';

  if ((req.headers['content-type'] || '').toLowerCase().includes(MIME_JSON)) {
    try {
      bodyRequest = JSON.parse(bodyRequest || '{}');
    } catch {
      // ignore
    }
  }

  let body;

  if (path === '/echo') {
    body = JSON.stringify(
      { bodyRequest, method: req.method, ok: true },
      null,
      2
    );
  }

  if (!body) {
    return null;
  }

  return buildResponse(
    C_STATUS_HTTP.OK,
    {
      Connection: 'close',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': CONTENT_TYPE_JSON_UTF_8,
    },
    body
  );
}

function handleDelete(path: string, req: T_REQUEST) {
  let body;

  if (path === '/echo') {
    body = JSON.stringify({ method: req.method, ok: true });
  }

  if (!body) {
    return null;
  }

  return buildResponse(
    C_STATUS_HTTP.OK,
    {
      Connection: 'close',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': CONTENT_TYPE_JSON_UTF_8,
    },
    body
  );
}

export { handleDelete, handleGet, handlePatch, handlePost, handlePut };
