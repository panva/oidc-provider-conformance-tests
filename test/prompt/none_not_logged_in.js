const assert = require('assert');
const { proceed, passed, clearCookies } = require('../helpers.js');

it('OP-prompt-none-NotLoggedIn', async function () {
  const test = this.test.title;
  await clearCookies();
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await proceed();
  assert(await passed(test));
});
