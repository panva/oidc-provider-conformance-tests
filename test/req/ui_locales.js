const { testUrl, login, proceed, passed, clearCookies } = require('../helpers');

it('OP-Req-ui_locales', async function () {
  const test = this.test.title;
  await clearCookies();
  await page.open(testUrl(test));
  await proceed();

  await page.render(`${test}.png`);
  await login();

  await passed(test);
});
