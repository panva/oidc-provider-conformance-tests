const { runSuite } = require('./helpers');

runSuite('CI').catch((err) => {
  console.error(err);
  process.exit(1);
});
