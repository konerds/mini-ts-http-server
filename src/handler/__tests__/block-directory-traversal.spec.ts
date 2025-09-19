import { afterAll, describe, expect, it } from 'vitest';

import { Handler } from '@handler';
import { ENCODING_UTF_8 } from '@http';

import { cleanDirTemp, createRequest, makeDirTemp } from './utils';

describe('Path traversal prevention', () => {
  const dirTemp = makeDirTemp();
  const handler = new Handler(dirTemp, console);

  afterAll(() => {
    cleanDirTemp(dirTemp);
  });

  it('blocks traversal attempts with 403', async () => {
    expect(
      Number(
        /^HTTP\/1\.1\s+(\d+)/.exec(
          (
            await handler.handleSuccess(
              createRequest('/../../directory/traversal/attack')
            )
          )
            .toString(ENCODING_UTF_8)
            .split('\r\n\r\n')[0]
            .split('\r\n')[0]
        )![1]
      )
    ).toBe(403);
  });
});
