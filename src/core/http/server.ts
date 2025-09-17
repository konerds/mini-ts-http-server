import { Server, createServer } from "net";
import { type T_REQUEST } from "./interfaces";
import { C_STATUS_HTTP, C_REASON_STATUS_HTTP } from "./constants";
import { parseHead, ErrorParseRequest } from "./request";
import { buildResponse } from "./response";

class ServerHTTP {
  private server?: Server;

  constructor(
    private hostname: string,
    private port: number,
    private handler: {
      handleSuccess(req: T_REQUEST): Promise<Buffer>;
      handleError(e: Error): Promise<Buffer>;
    },
    private logger: any = console
  ) {}

  start() {
    this.server = createServer((socket) => {
      let buffer = Buffer.alloc(0);

      socket.on("data", async (chunk) => {
        try {
          buffer = Buffer.concat([buffer, chunk]);
          const delimiter = Buffer.from("\r\n\r\n");
          const idxEndHead = buffer.indexOf(delimiter);

          if (idxEndHead === -1) {
            return;
          }

          const { method, path, httpVersion, headers, query } = parseHead(
            buffer.slice(0, idxEndHead).toString("utf8")
          );
          const szDelimiter = delimiter.length;
          const szNeeded =
            idxEndHead + szDelimiter + Number(headers["content-length"] || 0);

          if (buffer.length < szNeeded) {
            return;
          }

          const req: T_REQUEST = {
            method,
            path,
            httpVersion,
            headers,
            query,
            body: buffer.slice(idxEndHead + szDelimiter, szNeeded),
          };

          buffer = buffer.slice(szNeeded);
          this.logger.info({
            event: "request",
            method: req.method,
            path: req.path,
          });
          socket.write(await this.handler.handleSuccess(req));
          socket.end();
        } catch (e: any) {
          if (e instanceof ErrorParseRequest) {
            this.logger.warn({ event: "parse_error", message: e.message });
            socket.write(await this.handler.handleError(e));
            socket.end();

            return;
          }

          this.logger.error({ event: "server_error", message: e?.message });
          socket.write(
            buildResponse(
              C_STATUS_HTTP.INTERNAL_SERVER_ERROR,
              {
                "Content-Type": "text/plain; charset=utf-8",
                "Content-Length": String(
                  Buffer.byteLength(
                    C_REASON_STATUS_HTTP[C_STATUS_HTTP.INTERNAL_SERVER_ERROR]
                  )
                ),
                Connection: "close",
              },
              C_REASON_STATUS_HTTP[C_STATUS_HTTP.INTERNAL_SERVER_ERROR]
            )
          );
          socket.end();
        }
      });
    });

    this.server.listen(this.port, this.hostname, () => {
      this.logger.info({
        event: "listening",
        hostname: this.hostname,
        port: this.port,
      });
    });
  }
}

export { ServerHTTP };
