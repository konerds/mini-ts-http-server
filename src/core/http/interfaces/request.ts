import { T_METHOD } from './method';
import { T_QUERY } from './query';

interface T_REQUEST {
  method: T_METHOD;
  path: string;
  httpVersion: string;
  headers: Record<string, string>;
  query: T_QUERY;
  body: Buffer;
}

interface T_PARSED_HEAD_REQUEST {
  method: T_METHOD;
  path: string;
  httpVersion: string;
  headers: Record<string, string>;
  query: T_QUERY;
}

export { T_PARSED_HEAD_REQUEST, T_REQUEST };
