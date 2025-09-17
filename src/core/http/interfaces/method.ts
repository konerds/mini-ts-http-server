import { C_METHOD } from '../constants';

type T_METHOD = (typeof C_METHOD)[keyof typeof C_METHOD];

export { T_METHOD };
