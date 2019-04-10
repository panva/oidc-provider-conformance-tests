const {
  navigate, testUrl, login, passed,
} = require('../helpers');

it('OP-Registration-Sub-Differ', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();
  await tab.waitForSelector('button[type=submit]');
  await login();

  await passed(test);
});
