const assert = require('assert');
const { login, passed, clearCookies } = require('../helpers.js');

it('OP-claims-sub', async function () {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await login();
  const after = await page.evaluate(function () {
    return document.querySelector('a[href*=continue]').href;
  });
  await clearCookies();
  await page.open(after);
  await login();
  assert(await passed(test));
});
