const { testUrl, navigation, login, proceed, passed } = require('../helpers');

it.skip('OP-Req-claims_locales', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));
  await proceed();
  const nav = navigation();
  await login();
  await nav;
  const url = await page.property('url');
  if (url.includes('authz_cb') || url.includes('authz_post')) {
    await proceed();
  }

  await passed(test);
});
