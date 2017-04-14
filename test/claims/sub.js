const { testUrl, login, passed, clearCookies } = require('../helpers');

it('OP-claims-sub', async function () {
  const test = this.test.title;
  await page.open(testUrl(test));
  await login();
  const after = await page.evaluate(function () {
    const link = document.querySelector('a[href*=continue]');
    if (link) return link.href;
    return false;
  });
  if (!after) throw new Error('expected continue link to be present');
  await clearCookies();
  await page.open(after);
  await login();
  await passed(test);
});
