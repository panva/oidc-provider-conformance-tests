const { runSuite } = require('./helpers.js');

runSuite('CIT').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
