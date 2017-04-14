const assert = require('assert');
const { testUrl, login, proceed, passed } = require('../helpers');

it.skip('OP-Req-max_age=1', async function () { // investigated - test harness problem
  const test = this.test.title;
  await page.open(testUrl(test));
  await login();

  await new Promise(resolve => setTimeout(resolve, 5000));

  await proceed();
  await page.render(`${test}.png`);
  await login();

  assert(await passed(test));
});
