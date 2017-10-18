const {
  render, navigate, testUrl, login, proceed, passed,
} = require('../helpers');

it('OP-Req-max_age=1', async function () { // investigated - test harness problem
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();

  await new Promise(resolve => setTimeout(resolve, 5000));

  await proceed();
  await render(test);
  const body = await tab.evaluate(() => document.body.outerHTML);
  console.log('rendered view h1 says:', body.match(/<h1>(.+)<\/h1>/)[1]);
  await login();

  await passed(test);
});
