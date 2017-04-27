const { navigate, testUrl, login, proceed, passed } = require('../helpers');

it('OP-redirect_uri-MissingOK', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();
  await login();

  await passed(test);
});
