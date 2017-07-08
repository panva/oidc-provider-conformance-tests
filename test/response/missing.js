const { navigate, testUrl, proceed, passed } = require('../helpers');

it('OP-Response-Missing', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();
  await passed(test);
});
