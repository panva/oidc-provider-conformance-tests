const assert = require('assert');
const { navigation, login, proceed, passed } = require('../helpers.js');

it('OP-Req-claims_locales', async function () {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await proceed();
  const nav = navigation();
  await login();
  await nav;
  const url = await page.property('url');
  if (url.includes('authz_cb') || url.includes('authz_post')) {
    await proceed();
  }

  assert(await passed(test));
});
