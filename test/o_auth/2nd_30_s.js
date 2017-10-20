const {
  navigate, testUrl, login, proceed, passed,
} = require('../helpers');

it('OP-OAuth-2nd-30s', async function () {
  const test = this.test.title;

  await navigate(testUrl(test));
  await proceed();
  await login();

  if ((await tab.url()).endsWith('/authz_cb')) {
    await tab.waitForNavigation({
      timeout: 0,
      waitUntil: 'networkidle',
    });
  }

  await passed(test);
});
