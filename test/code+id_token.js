const { runSuite } = require('./helpers.js');

runSuite('CI').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
