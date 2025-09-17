const C_STATUS_HTTP = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  OK: 200,
} as const;

const C_REASON_STATUS_HTTP = {
  [C_STATUS_HTTP.BAD_REQUEST]: 'Bad Request',
  [C_STATUS_HTTP.FORBIDDEN]: 'Forbidden',
  [C_STATUS_HTTP.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [C_STATUS_HTTP.NOT_FOUND]: 'Not Found',
  [C_STATUS_HTTP.OK]: 'OK',
} as Record<number, string>;

export { C_REASON_STATUS_HTTP, C_STATUS_HTTP };
