const {
  navigate, testUrl, login, passed, clearCookies,
} = require('../helpers');

it('OP-claims-sub', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();

  await tab.waitForSelector('div.jumbotron', { timeout: 0 });

  const after = await tab.evaluate(() => document.links[0].href);

  await clearCookies();
  await navigate(after);
  await login();
  await passed(test);
});
