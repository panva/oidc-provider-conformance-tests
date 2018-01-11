const puppeteer = require('puppeteer');
const { clearCookies } = require('./helpers');

let browser;

const TRAVIS = 'TRAVIS' in process.env && 'CI' in process.env;

before(async function () {
  browser = await puppeteer.launch(TRAVIS ? {
    args: ['--no-sandbox'],
  } : undefined);
  global.tab = await browser.newPage();
});

before(async function () {
  await clearCookies();
  const configuration = await tab.evaluate(() => document.body.innerText);
  console.log('OP .well-known/openid-configuration', JSON.parse(configuration, null, 4));
});

after(async function () {
  await browser.close();
});
