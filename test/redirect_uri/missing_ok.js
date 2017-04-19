const { testUrl, login, proceed, passed } = require('../helpers');

it.skip('OP-redirect_uri-MissingOK', async function () { // investigated - must restart upfront.
  const test = this.test.title;
  await page.open(testUrl(test));
  await proceed();
  await login();

  await passed(test);
});
