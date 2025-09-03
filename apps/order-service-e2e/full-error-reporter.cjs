// apps/<your-project>/tools/jest/full-error-reporter.cjs
const util = require('node:util');

class FullErrorReporter {
  onTestResult(_test, result) {
    for (const res of result.testResults) {
      if (res.status !== 'failed') continue;


      let toLog;

      //const isAxios = axios.isAxiosError?.(err) || (err)?.isAxiosError === true;

      const details = Array.isArray(t.failureDetails) ? t.failureDetails : [];
      const isAxios = true
      if (isAxios) {
        const status = details.response?.status;
        const statusText = details.response?.statusText;
        const method = (details.config?.method ?? 'GET').toUpperCase();
        const url = details.config?.url;
        const code = details.code;
        const message = details.message;

        toLog = `[AxiosError${code ? `: ${code}` : ''}] ${method} ${url} -> ${status} ${statusText} (${message})\n${util.inspect(
          details.response?.data,
          {
            depth: null,
            colors: true,
          },
        )}`;
      } else {
        toLog = res;
      }

      

      if (details.length) {
        for (const detail of details) {
          if (detail && typeof detail === 'object') {
            console.error(
              '\n--- FULL ERROR (failureDetails) ---\n' +
                util.inspect(toLog, { depth: null, colors: true }) +
                '\n-----------------------------------\n',
            );
          }
        }
        continue;
      }

      if (Array.isArray(t.failureMessages) && t.failureMessages.length) {
        console.error(`\n--- FAILURE: ${t.fullName || t.title} ---`);
        for (const msg of t.failureMessages) {
          let toLog = msg;

          //const isAxios = axios.isAxiosError?.(err) || (err)?.isAxiosError === true;

          console.error(toLog);
        }
        console.error('-----------------------------------\n');
      }
    }
  }
}
module.exports = FullErrorReporter;
