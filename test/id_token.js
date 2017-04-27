const { runSuite } = require('./helpers');

runSuite('I').catch((err) => {
  console.error(err);
  process.exit(1);
});
