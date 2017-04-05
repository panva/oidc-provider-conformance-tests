const assert = require('assert');
const { proceed, passed } = require('../helpers.js');

it('OP-Response-Missing', async function () {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);

  await proceed();
  assert(await passed(test));
});
