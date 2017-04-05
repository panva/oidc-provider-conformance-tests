const assert = require('assert');
const { login, proceed, passed } = require('../helpers.js');

it.skip('OP-Req-max_age=1', async function () {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await login();

  await new Promise(resolve => setTimeout(resolve, 5000));

  await proceed();
  await page.render(`${test}.png`);
  await login();

  assert(await passed(test));
});
