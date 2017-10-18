const {
  render, navigate, testUrl, login, proceed, passed, clearCookies,
} = require('../helpers');

it('OP-Req-ui_locales', async function () {
  const test = this.test.title;
  await clearCookies();
  await navigate(testUrl(test));
  await proceed();

  await render(test);
  const body = await tab.evaluate(() => document.body.outerHTML);
  console.log('rendered view h1 says:', body.match(/<h1>(.+)<\/h1>/)[1]);
  await login();

  await passed(test);
});
