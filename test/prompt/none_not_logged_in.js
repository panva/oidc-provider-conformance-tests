const {
  navigate, testUrl, proceed, passed, clearCookies,
} = require('../helpers');

it('OP-prompt-none-NotLoggedIn', async function () {
  const test = this.test.title;
  await clearCookies();
  await navigate(testUrl(test));
  await proceed();
  await passed(test);
});
