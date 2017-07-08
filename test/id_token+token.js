const { runSuite } = require('./helpers');

runSuite('IT').catch((err) => {
  console.error(err);
  process.exit(1);
});
