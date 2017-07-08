const { runSuite } = require('./helpers');

runSuite('CIT').catch((err) => {
  console.error(err);
  process.exit(1);
});
