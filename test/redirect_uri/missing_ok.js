const assert = require('assert');
const { testUrl, login, proceed, passed, restart } = require('../helpers');

it('OP-redirect_uri-MissingOK', async function () {
  // await restart(); // otherwise the OP testing software sends more URIs TODO: cleanup

  const test = this.test.title;
  await page.open(testUrl(test));
  await proceed();
  await login();

  assert(await passed(test));
});
