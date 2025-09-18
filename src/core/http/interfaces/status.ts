import { C_STATUS_HTTP } from '../constants';

type T_STATUS_HTTP = (typeof C_STATUS_HTTP)[keyof typeof C_STATUS_HTTP];

export { T_STATUS_HTTP };
