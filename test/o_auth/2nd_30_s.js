const assert = require('assert');
const { login, proceed, passed } = require('../helpers.js');

it('OP-OAuth-2nd-30s', async function () {
  const test = this.test.title;

  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await proceed();
  await login();

  assert(await passed(test));
});
