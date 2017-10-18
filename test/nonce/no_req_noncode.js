const {
  navigate, testUrl, proceed, passed,
} = require('../helpers');

it('OP-nonce-NoReq-noncode', async function () {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();

  await passed(test);
});
