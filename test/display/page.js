const assert = require('assert');
const { login, proceed, passed, clearCookies } = require('../helpers.js');

// TODO: DRY

it('OP-display-page', async function () {
  const test = this.test.title;
  await clearCookies();
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await proceed();
  await page.render(`${test}.png`);
  await login();

  assert(await passed(test));
});
