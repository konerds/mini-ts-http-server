import { buildResponse, C_STATUS_HTTP, type T_REQUEST } from '@http';

import { MIME_JSON } from './constants';

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
      'Content-Type': MIME_JSON,
    },
    body
  );
}

function handlePost(path: string, req: T_REQUEST) {
  let bodyRequest = req.body?.toString('utf8') ?? '';

  if (
    (req.headers['content-type'] || '')
      .toLowerCase()
      .includes('application/json')
  ) {
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
      'Content-Type': MIME_JSON,
    },
    body
  );
}

function handlePut(path: string, req: T_REQUEST) {
  let bodyRequest = req.body?.toString('utf8') ?? '';

  if (
    (req.headers['content-type'] || '')
      .toLowerCase()
      .includes('application/json')
  ) {
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
      'Content-Type': MIME_JSON,
    },
    body
  );
}

function handlePatch(path: string, req: T_REQUEST) {
  let bodyRequest = req.body?.toString('utf8') ?? '';

  if (
    (req.headers['content-type'] || '')
      .toLowerCase()
      .includes('application/json')
  ) {
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
      'Content-Type': MIME_JSON,
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
      'Content-Type': MIME_JSON,
    },
    body
  );
}

export { handleDelete, handleGet, handlePatch, handlePost, handlePut };
