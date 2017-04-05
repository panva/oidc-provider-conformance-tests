const assert = require('assert');
const { login, passed } = require('../helpers.js');

it('OP-Registration-Sub-Differ', async function () {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await login();
  await login();

  assert(await passed(test));
});
