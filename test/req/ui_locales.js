const {
  render, navigate, testUrl, login, proceed, passed, clearCookies,
} = require('../helpers');

it('OP-Req-ui_locales', async function () {
  const test = this.test.title;
  await clearCookies();
  await navigate(testUrl(test));
  await proceed();
  await render(test);
  await login();
  await passed(test);
});
