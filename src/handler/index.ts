import { C_STATUS_HTTP, buildResponse, type T_REQUEST } from "../core/http";

function responseText(
  body: string,
  status: number = C_STATUS_HTTP.OK,
  type = "text/plain; charset=utf-8"
) {
  return buildResponse(
    status,
    {
      "Content-Type": type,
      "Content-Length": String(Buffer.byteLength(body)),
      Connection: "close",
    },
    body
  );
}

function responseJSON(obj: any, status: number = C_STATUS_HTTP.OK) {
  return responseText(
    JSON.stringify(obj),
    status,
    "application/json; charset=utf-8"
  );
}

const handler = {
  async handleSuccess(req: T_REQUEST): Promise<Buffer> {
    if (req.method === "GET" && req.path === "/api") {
      return responseJSON({ ok: true });
    }

    return responseText("not found", C_STATUS_HTTP.NOT_FOUND);
  },
  async handleError(): Promise<Buffer> {
    return responseText("bad request", C_STATUS_HTTP.BAD_REQUEST);
  },
};

export { handler };
