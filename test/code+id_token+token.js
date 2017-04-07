const { runSuite } = require('./helpers');

runSuite('CIT').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
