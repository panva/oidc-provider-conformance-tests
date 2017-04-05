const { runSuite } = require('./helpers.js');

runSuite('I').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
