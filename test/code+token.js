const { runSuite } = require('./helpers');

runSuite('CT').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
