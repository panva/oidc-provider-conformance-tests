const phantom = require('phantom');
const { restart } = require('./helpers');

let instance;

before(async function () {
  instance = await phantom.create();
  global.page = await instance.createPage();
});

after(async function () {
  await instance.exit();
});

let i = 0;

beforeEach(async function () {
  i++; // eslint-disable-line
  if (i < 15) return;
  i = 0;
  await restart();
});
