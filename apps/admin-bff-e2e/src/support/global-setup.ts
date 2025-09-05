import { waitForPortOpen } from '@nx/node/utils';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  // Ensure the target server is reachable before tests execute
  await waitForPortOpen(port, { host });

  // Persist teardown message for the matching global hook
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
