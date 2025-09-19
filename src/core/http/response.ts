import { C_REASON_STATUS_HTTP, ENCODING_UTF_8 } from './constants';

function buildResponse(
  status: number,
  headers: Record<string, string> = {},
  body: Buffer | string = ''
) {
  return Buffer.concat([
    Buffer.from(
      `HTTP/1.1 ${status} ${C_REASON_STATUS_HTTP[status] || 'OK'}\r\n` +
        Object.entries(headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\r\n') +
        '\r\n\r\n',
      ENCODING_UTF_8
    ),
    Buffer.isBuffer(body) ? body : Buffer.from(body),
  ]);
}

export { buildResponse };
