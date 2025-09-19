import { buildResponse, C_REASON_STATUS_HTTP, type T_STATUS_HTTP } from '@http';
import {
  ENCODING_LATIN1,
  ENCODING_UTF_8,
  getWrappedWithCharset,
  MIME_CSS,
  MIME_IMAGE_GIF,
  MIME_IMAGE_JPEG,
  MIME_IMAGE_PNG,
  MIME_IMAGE_SVG_XML,
  MIME_IMAGE_WEBP,
  MIME_IMAGE_X_ICON,
  MIME_JSON,
  MIME_OCTET_STREAM,
  MIME_TEXT_HTML,
  MIME_TEXT_JAVASCRIPT,
  MIME_TEXT_PLAIN,
} from '@http';

import { PATH_API } from './constants.js';
import type { T_RANGE_MEDIA } from './interfaces.js';

function getContentType(file: string) {
  if (file.endsWith('.html')) {
    return MIME_TEXT_HTML;
  }

  if (file.endsWith('.css')) {
    return getWrappedWithCharset(MIME_CSS);
  }

  if (file.endsWith('.js')) {
    return getWrappedWithCharset(MIME_TEXT_JAVASCRIPT);
  }

  if (file.endsWith('.json') || file.endsWith('.map')) {
    return getWrappedWithCharset(MIME_JSON);
  }

  if (file.endsWith('.txt')) {
    return getWrappedWithCharset(MIME_TEXT_PLAIN);
  }

  if (file.endsWith('.ico')) {
    return MIME_IMAGE_X_ICON;
  }

  if (file.endsWith('.svg')) {
    return MIME_IMAGE_SVG_XML;
  }

  if (file.endsWith('.webp')) {
    return MIME_IMAGE_WEBP;
  }

  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return MIME_IMAGE_JPEG;
  }

  if (file.endsWith('.png')) {
    return MIME_IMAGE_PNG;
  }

  if (file.endsWith('.gif')) {
    return MIME_IMAGE_GIF;
  }

  return getWrappedWithCharset(MIME_TEXT_PLAIN);
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
      'Content-Type': getWrappedWithCharset(MIME_TEXT_PLAIN),
    },
    body
  );
}

function isPathRequestAPI(path: string) {
  return path === PATH_API || path.startsWith(`${PATH_API}/`);
}

function getBoundary(ct: string) {
  const matcheds = /boundary=([^;]+)/i.exec(ct || '');

  if (!matcheds) {
    return null;
  }

  return matcheds[1];
}

function safeDecode5987(v: string) {
  try {
    return decodeURIComponent(v.replace(/\+/g, '%20'));
  } catch {
    return v;
  }
}

function parseMultipart(ct: string, body: Buffer) {
  const boundary = getBoundary(ct);

  if (!boundary) {
    return null;
  }

  const raw = body.toString(ENCODING_LATIN1);
  const idxEnd = raw.indexOf(`--${boundary}--`);
  const segments = (idxEnd !== -1 ? raw.slice(0, idxEnd) : raw)
    .split(`--${boundary}`)
    .slice(1);
  const partsRaw = segments
    .map((segment) => {
      if (segment.startsWith('\r\n')) {
        segment = segment.slice(2);
      }

      const idx = segment.indexOf('\r\n\r\n');

      if (idx < 0) {
        return null;
      }

      const linesHead = segment.slice(0, idx).trim().split('\r\n');
      let contentLatin1 = segment.slice(idx + 4);

      if (contentLatin1.endsWith('\r\n')) {
        contentLatin1 = contentLatin1.slice(0, -2);
      }

      const headers: Record<string, string> = {};

      for (const line of linesHead) {
        const idxDelimiter = line.indexOf(':');

        if (idxDelimiter === -1) {
          continue;
        }

        headers[line.slice(0, idxDelimiter).trim().toLowerCase()] = line
          .slice(idxDelimiter + 1)
          .trim();
      }

      const contentDisposition = headers['content-disposition'] || '';
      const filenameAsterisk = /;\s*filename\*=(?:UTF-8'')?([^;]+)/i.exec(
        contentDisposition
      )?.[1];
      const name = /;\s*name="([^"]+)"/i.exec(contentDisposition);

      return {
        contentType: (headers['content-type'] || '').toLowerCase(),
        data: Buffer.from(contentLatin1, ENCODING_LATIN1),
        filename: filenameAsterisk
          ? safeDecode5987(filenameAsterisk)
          : (/;\s*filename="([^"]*)"/i.exec(contentDisposition)?.[1] ?? ''),
        hasFilename: /;\s*filename\*?=/.test(contentDisposition),
        headers,
        name: name ? name[1] : '',
      };
    })
    .filter(Boolean);

  const fields: Record<string, string | string[]> = {};
  const files: Array<{
    name: string;
    filename: string;
    contentType: string;
    size: number;
  }> = [];

  for (const part of partsRaw) {
    if (!part) {
      continue;
    }

    const { contentType, data, filename, hasFilename, name } = part;

    if (hasFilename) {
      files.push({
        contentType: contentType || MIME_OCTET_STREAM,
        filename: filename,
        name: name,
        size: data.length,
      });

      continue;
    }

    const v = data.toString(ENCODING_UTF_8);

    if (!Object.prototype.hasOwnProperty.call(fields, name)) {
      fields[name] = v;

      continue;
    }

    const fieldPrev = fields[name];
    fields[name] = Array.isArray(fieldPrev)
      ? fieldPrev.concat(v)
      : [fieldPrev as string, v];
  }

  return { fields, files };
}

export {
  buildResponseErrorByStatus,
  getContentType,
  getWrappedWithCharset,
  isAcceptingHTML,
  isPathRequestAPI,
  parseMultipart,
};
