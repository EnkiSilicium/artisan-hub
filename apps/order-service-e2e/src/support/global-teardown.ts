/* eslint-disable */
module.exports = async function () {
  const stack = (globalThis as any).__E2E_STACK__;
  console.log('\n[E2E] Tearing down...\n');

  try { stack?.app?.kill('SIGTERM'); } catch {}
  try { await stack?.pg?.stop(); } catch {}
  try { await stack?.kafka?.stop(); } catch {}

  console.log('[E2E] Done.');
};
