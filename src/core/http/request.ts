import { parseQueryString } from "./query";
import type { T_METHOD, T_PARSED_HEAD_REQUEST } from "./interfaces";

class ErrorParseRequest extends Error {}

function parseHead(textsHead: string) {
  const lines = textsHead.split("\r\n");
  let [method, path, httpVersion] = (lines[0] || "").split(" ");

  if (!method || !path || !httpVersion) {
    throw new ErrorParseRequest("Invalid start line");
  }

  const headers: Record<string, string> = {};

  for (const line of lines) {
    const idx = line.indexOf(":");

    if (idx <= 0) {
      continue;
    }

    headers[line.slice(0, idx).trim().toLowerCase()] = line
      .slice(idx + 1)
      .trim();
  }

  let query = {};
  const idxStartQueryString = path.indexOf("?");

  if (idxStartQueryString >= 0) {
    path = path.slice(0, idxStartQueryString);
    query = parseQueryString(path.slice(idxStartQueryString + 1));
  }

  return {
    method: method as T_METHOD,
    path,
    httpVersion,
    headers,
    query,
  } as T_PARSED_HEAD_REQUEST;
}

export { parseHead, ErrorParseRequest };
