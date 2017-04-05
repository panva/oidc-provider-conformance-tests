const { runSuite } = require('./helpers.js');

runSuite('CT').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
