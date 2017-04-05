const assert = require('assert');
const { login, proceed, passed } = require('../helpers.js');

it('OP-prompt-login', async function () {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await login();
  await proceed();
  await page.render(`${test}.png`);
  await login();

  assert(await passed(test));
});
