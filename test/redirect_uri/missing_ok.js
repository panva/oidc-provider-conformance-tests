const { testUrl, login, proceed, passed } = require('../helpers');

it('OP-redirect_uri-MissingOK', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));
  await proceed();
  await login();

  await passed(test);
});
