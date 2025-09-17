import chalk from 'chalk';
import { defineConfig } from 'vitest/config';

class ReporterLineBreak {
  onTestCaseResult(tc) {
    const state =
      typeof tc.result === 'function' ? tc.result().state : tc.result?.state;

    const name = tc.fullName ?? tc.name;
    let icon = '',
      tint = (s) => s;

    switch (state) {
      case 'passed':
        icon = '✓';
        tint = chalk.green;

        break;
      case 'failed':
        icon = '✕';
        tint = chalk.red;

        break;
      case 'skipped':
        icon = '⚠';
        tint = chalk.yellow;

        break;
      default:
        icon = '-';
    }

    // eslint-disable-next-line no-console
    console.log(`${tint(icon)} ${name}`);
  }
}

export default defineConfig({
  test: {
    reporters: ['default', new ReporterLineBreak()],
    setupFiles: ['./vitest.setup.js'],
  },
});
