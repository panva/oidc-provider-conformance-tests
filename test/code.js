const { runSuite } = require('./helpers');

runSuite('C').catch((err) => {
  console.error(err);
  process.exit(1);
});
