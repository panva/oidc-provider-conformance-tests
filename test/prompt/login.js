const {
  render, navigate, testUrl, login, proceed, passed,
} = require('../helpers');

it('OP-prompt-login', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();
  await proceed();

  await render(test);
  await login();
  await passed(test);
});
