const assert = require('assert');
const { testUrl, login, proceed, passed } = require('../helpers');

it('OP-prompt-login', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));
  await login();
  await proceed();
  await page.render(`${test}.png`);
  await login();

  assert(await passed(test));
});
