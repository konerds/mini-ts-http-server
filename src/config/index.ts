import { resolve } from "path";

const CWD = process.cwd();
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_ENV_PROD = NODE_ENV === "production";

const CONFIGS_DEFAULT = {
  CWD,
  HOST_SERVER: process.env.HOST_SERVER || "127.0.0.1",
  PORT_SERVER: Number(process.env.PORT_SERVER || 3000),
  NODE_ENV,
  IS_ENV_DEV: NODE_ENV === "development",
  IS_ENV_TEST: NODE_ENV === "test",
  IS_ENV_PROD,
  PATH_STATIC: IS_ENV_PROD
    ? resolve(CWD, "dist", process.env.PATH_STATIC || "build")
    : resolve(__dirname, "../static"),
  LOG_LEVEL: process.env.LOG_LEVEL || (IS_ENV_PROD ? "info" : "debug"),
};

export function getConfigs(configs = {}) {
  return {
    ...CONFIGS_DEFAULT,
    ...configs,
  };
}
