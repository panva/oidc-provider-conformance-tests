const { navigate, testUrl, login, proceed, passed } = require('../helpers');

it('OP-Req-claims_locales', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();
  await login();

  try {
    await passed(test);
  } catch (err) {
    await proceed();
    await passed(test);
  }
});
