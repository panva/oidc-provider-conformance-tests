const { runSuite } = require('./helpers.js');

runSuite('IT').catch((err) => {
  console.error(err); // eslint-disable-line
  process.exit(1);
});
