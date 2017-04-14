const { testUrl, login, passed } = require('../helpers');

it('OP-Registration-Sub-Differ', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));
  await login();
  await login();

  await passed(test);
});
