const assert = require('assert');
const { testUrl, login, passed, clearCookies } = require('../helpers');

it('OP-claims-sub', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));
  await login();
  const after = await page.evaluate(function () {
    return document.querySelector('a[href*=continue]').href;
  });
  await clearCookies();
  await page.open(after);
  await login();
  assert(await passed(test));
});
