const assert = require('assert');
const { testUrl, login, proceed, passed } = require('../helpers');

it('OP-OAuth-2nd-30s', async function () {
  const test = this.test.title;

  await page.open(testUrl(test));
  await proceed();
  await login();

  assert(await passed(test));
});
