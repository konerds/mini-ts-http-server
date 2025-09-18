import { readFile } from 'fs/promises';
import { join, posix } from 'path';

import {
  buildResponse,
  C_METHOD,
  C_STATUS_HTTP,
  I_HANDLER,
  type T_REQUEST,
} from '@http';

import {
  handleDelete,
  handleGet,
  handlePatch,
  handlePost,
  handlePut,
} from './router';
import {
  buildResponseErrorByStatus,
  getContentType,
  isAcceptingHTML,
  isPathRequestAPI,
} from './utils';

class Handler implements I_HANDLER {
  private pathStatic: string;
  private logger: any;

  constructor(pathStatic: string, logger: any = console) {
    this.pathStatic = pathStatic;
    this.logger = logger;
  }

  private handleError400() {
    return buildResponseErrorByStatus(C_STATUS_HTTP.BAD_REQUEST);
  }

  private handleError403() {
    return buildResponseErrorByStatus(C_STATUS_HTTP.FORBIDDEN);
  }

  private handleError404() {
    return buildResponseErrorByStatus(C_STATUS_HTTP.NOT_FOUND);
  }

  private async handleRequestAPI(req: T_REQUEST) {
    if (!isPathRequestAPI(req.path)) {
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

  async handleSuccess(req: T_REQUEST) {
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

    if (isPathRequestAPI(req.path)) {
      return this.handleError404();
    }

    if ((response = await this.serveFileStatic(req.path))) {
      return response;
    }

    if (posix.extname(req.path) !== '') {
      return this.handleError404();
    }

    if (
      req.method === C_METHOD.GET &&
      isAcceptingHTML(req.headers?.accept) &&
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
