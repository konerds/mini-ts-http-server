import { buildResponse, C_REASON_STATUS_HTTP, type T_STATUS_HTTP } from '@http';

import {
  MIME_JSON,
  MIME_TEXT_HTML,
  MIME_TEXT_PLAIN,
  PATH_API,
} from './constants.js';
import type { T_RANGE_MEDIA } from './interfaces.js';

function getContentType(file: string) {
  if (file.endsWith('.html')) {
    return MIME_TEXT_HTML;
  }

  if (file.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }

  if (file.endsWith('.js')) {
    return 'text/javascript; charset=utf-8';
  }

  if (file.endsWith('.json') || file.endsWith('.map')) {
    return MIME_JSON;
  }

  if (file.endsWith('.txt')) {
    return MIME_TEXT_PLAIN;
  }

  if (file.endsWith('.ico')) {
    return 'image/x-icon';
  }

  if (file.endsWith('.svg')) {
    return 'image/svg+xml';
  }

  if (file.endsWith('.webp')) {
    return 'image/webp';
  }

  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (file.endsWith('.png')) {
    return 'image/png';
  }

  if (file.endsWith('.gif')) {
    return 'image/gif';
  }

  return MIME_TEXT_PLAIN;
}

function effectiveQ(
  ranges: T_RANGE_MEDIA[],
  type: string,
  subtype: string
): number {
  let tckMaxQ = 0;
  let tckMaxSpec = -1;

  for (const r of ranges) {
    if (
      (r.type === type || r.type === '*') &&
      (r.subtype === subtype || r.subtype === '*')
    ) {
      const spec = (r.type === type ? 1 : 0) + (r.subtype === subtype ? 1 : 0);

      if (spec > tckMaxSpec || (spec === tckMaxSpec && r.q > tckMaxQ)) {
        tckMaxSpec = spec;
        tckMaxQ = r.q;
      }
    }
  }

  return tckMaxQ;
}

function isAcceptingHTML(accept?: string) {
  const ranges = (accept?.trim() || '*/*')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [typePart, ...params] = item.split(';').map((x) => x.trim());
      const [type = '*', subtype = '*'] = typePart.split('/');
      let q = 1;

      for (const p of params) {
        const [k, v] = p.split('=').map((x) => x.trim());

        if (k === 'q') {
          const n = parseFloat(v);

          if (!Number.isNaN(n)) {
            q = n;
          }
        }
      }

      return { q, subtype, type };
    })
    .filter((r) => r.type && r.subtype && r.q > 0);

  return (
    effectiveQ(ranges, 'text', 'html') > 0 ||
    effectiveQ(ranges, 'application', 'xhtml+xml') > 0
  );
}

function buildResponseErrorByStatus(status: T_STATUS_HTTP) {
  const body = C_REASON_STATUS_HTTP[status];

  return buildResponse(
    status,
    {
      Connection: 'close',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-Type': MIME_TEXT_PLAIN,
    },
    body
  );
}

function isPathRequestAPI(path: string) {
  return path === PATH_API || path.startsWith(`${PATH_API}/`);
}

export {
  buildResponseErrorByStatus,
  getContentType,
  isAcceptingHTML,
  isPathRequestAPI,
};
