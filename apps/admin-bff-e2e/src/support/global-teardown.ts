import { killPort } from '@nx/node/utils';
/* eslint-disable */

module.exports = async function () {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  // Terminate any process still bound to the test port
  await killPort(port);
  // Mirror setup's message for visibility in CI logs
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
