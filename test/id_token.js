const { runSuite } = require('./helpers');

runSuite('I').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
