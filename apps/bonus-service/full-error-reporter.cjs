// apps/<your-project>/tools/jest/full-error-reporter.cjs
const util = require('node:util');

class FullErrorReporter {
  onTestResult(_test, result) {
    for (const t of result.testResults) {
      if (t.status !== 'failed') continue;

      const details = Array.isArray(t.failureDetails) ? t.failureDetails : [];
      if (details.length) {
        for (const d of details) {
          if (d && typeof d === 'object') {
            console.error(
              '\n--- FULL ERROR (failureDetails) ---\n' +
                util.inspect(d, { depth: null, colors: true }) +
                '\n-----------------------------------\n'
            );
          }
        }
        continue;
      }

      if (Array.isArray(t.failureMessages) && t.failureMessages.length) {
        console.error(`\n--- FAILURE: ${t.fullName || t.title} ---`);
        for (const msg of t.failureMessages) console.error(msg);
        console.error('-----------------------------------\n');
      }
    }
  }
}
module.exports = FullErrorReporter;
