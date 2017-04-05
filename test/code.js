const { runSuite } = require('./helpers.js');

runSuite('C').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
