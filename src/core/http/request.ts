import type { T_METHOD, T_PARSED_HEAD_REQUEST } from './interfaces';
import { parseQueryString } from './query';

class ErrorParseRequest extends Error {}

function parseHead(textsHead: string) {
  const lines = textsHead.split('\r\n');
  const parts = (lines[0] || '').split(' ');
  const method = parts[0];
  const httpVersion = parts[2];
  let path = parts[1];

  if (!method || !path || !httpVersion) {
    throw new ErrorParseRequest('Invalid start line');
  }

  const headers: Record<string, string> = {};

  for (const line of lines) {
    const idx = line.indexOf(':');

    if (idx <= 0) {
      continue;
    }

    headers[line.slice(0, idx).trim().toLowerCase()] = line
      .slice(idx + 1)
      .trim();
  }

  let query = {};
  const idxStartQueryString = path.indexOf('?');

  if (idxStartQueryString >= 0) {
    query = parseQueryString(path.slice(idxStartQueryString + 1));
    path = path.slice(0, idxStartQueryString);
  }

  return {
    headers,
    httpVersion,
    method: method as T_METHOD,
    path,
    query,
  } as T_PARSED_HEAD_REQUEST;
}

export { ErrorParseRequest, parseHead };
