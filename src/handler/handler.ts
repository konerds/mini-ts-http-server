import { readFile } from 'fs/promises';
import { join, posix } from 'path';

import {
  buildResponse,
  C_METHOD,
  C_REASON_STATUS_HTTP,
  C_STATUS_HTTP,
  I_HANDLER,
  type T_REQUEST,
} from '@http';

import { MIME_TEXT_PLAIN } from './constants';
import {
  handleDelete,
  handleGet,
  handlePatch,
  handlePost,
  handlePut,
} from './router';
import { getContentType } from './utils';

class Handler implements I_HANDLER {
  private pathStatic: string;
  private logger: any;

  constructor(pathStatic: string, logger: any = console) {
    this.pathStatic = pathStatic;
    this.logger = logger;
  }

  private handleError400() {
    const body = C_REASON_STATUS_HTTP[C_STATUS_HTTP.BAD_REQUEST];

    return buildResponse(
      C_STATUS_HTTP.BAD_REQUEST,
      {
        Connection: 'close',
        'Content-Length': String(Buffer.byteLength(body)),
        'Content-Type': MIME_TEXT_PLAIN,
      },
      body
    );
  }

  private handleError403() {
    const body = C_REASON_STATUS_HTTP[C_STATUS_HTTP.FORBIDDEN];

    return buildResponse(
      C_STATUS_HTTP.FORBIDDEN,
      {
        Connection: 'close',
        'Content-Length': String(Buffer.byteLength(body)),
        'Content-Type': MIME_TEXT_PLAIN,
      },
      body
    );
  }

  private handleError404() {
    const body = C_REASON_STATUS_HTTP[C_STATUS_HTTP.NOT_FOUND];

    return buildResponse(
      C_STATUS_HTTP.NOT_FOUND,
      {
        Connection: 'close',
        'Content-Length': String(Buffer.byteLength(body)),
        'Content-Type': MIME_TEXT_PLAIN,
      },
      body
    );
  }

  private async handleRequestAPI(req: T_REQUEST) {
    if (!req.path.startsWith('/api/')) {
      return null;
    }

    const method = req.method;
    const path = req.path.slice(4);

    if (method === C_METHOD.GET) {
      return handleGet(path, req);
    }

    if (method === C_METHOD.POST) {
      return handlePost(path, req);
    }

    if (method === C_METHOD.PUT) {
      return handlePut(path, req);
    }

    if (method === C_METHOD.PATCH) {
      return handlePatch(path, req);
    }

    if (method === C_METHOD.DELETE) {
      return handleDelete(path, req);
    }

    return null;
  }

  private async serveFileStatic(pathURL: string) {
    const pathAbsSanitized = join(
      this.pathStatic,
      posix.normalize(pathURL.split('?')[0]).replace(/^\/+/, '')
    );

    if (!pathAbsSanitized.startsWith(this.pathStatic)) {
      return this.handleError403();
    }

    try {
      const data = await readFile(pathAbsSanitized);

      return buildResponse(
        C_STATUS_HTTP.OK,
        {
          Connection: 'close',
          'Content-Length': String(data.length),
          'Content-Type': getContentType(pathAbsSanitized),
        },
        data
      );
    } catch {
      return null;
    }
  }

  async handleSuccess(req: T_REQUEST): Promise<Buffer> {
    const fileHTMLEntry = '/index.html';

    let response;

    if (
      (req.path === '/' || req.path === '') &&
      (response = await this.serveFileStatic(fileHTMLEntry))
    ) {
      return response;
    }

    if ((response = await this.handleRequestAPI(req))) {
      return response;
    }

    if (req.path.startsWith('/api/')) {
      return this.handleError404();
    }

    if ((response = await this.serveFileStatic(req.path))) {
      return response;
    }

    if (posix.extname(req.path) !== '') {
      return this.handleError404();
    }

    if (
      req.method === 'GET' &&
      (response = await this.serveFileStatic('/index.html'))
    ) {
      return response;
    }

    return this.handleError404();
  }

  async handleError(e: Error) {
    this.logger.error({ event: 'handler_error', message: e?.message });

    return this.handleError400();
  }
}

export { Handler };
