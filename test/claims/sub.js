const {
  navigate, testUrl, login, passed, clearCookies,
} = require('../helpers');

it('OP-claims-sub', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();

  const { result: { value: after } } = await Runtime.evaluate({
    expression: 'document.links[0].href',
  });

  if (!after) throw new Error('expected continue link to be present');

  await clearCookies();
  await navigate(after);
  await login();
  await passed(test);
});
