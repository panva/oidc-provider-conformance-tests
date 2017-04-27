const { runSuite } = require('./helpers');

runSuite('CT').catch((err) => {
  console.error(err);
  process.exit(1);
});
