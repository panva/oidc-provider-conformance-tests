const assert = require('assert');
const { login, proceed, passed, restart } = require('../helpers.js');

it('OP-redirect_uri-MissingOK', async function () {
  await restart(); // otherwise the OP testing software sends more URIs

  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await proceed();
  await login();

  assert(await passed(test));
});
