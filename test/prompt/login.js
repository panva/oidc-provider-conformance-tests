const {
  render, navigate, testUrl, login, proceed, passed,
} = require('../helpers');

it('OP-prompt-login', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();
  await proceed();

  await render(test);
  const body = await tab.evaluate(() => document.body.outerHTML);
  console.log('rendered view h1 says:', body.match(/<h1>(.+)<\/h1>/)[1]);

  await login();

  await passed(test);
});
