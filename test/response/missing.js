const assert = require('assert');
const { testUrl, proceed, passed } = require('../helpers');

it('OP-Response-Missing', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));

  await proceed();
  assert(await passed(test));
});
