const puppeteer = require('puppeteer');
const { clearCookies } = require('./helpers');

let browser;

before(async function () {
  browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    ...('CI' in process.env ? { args: ['--no-sandbox'] } : undefined),
  });
  global.tab = await browser.newPage();
});

before(async function () {
  await clearCookies();
  const configuration = await tab.evaluate(() => document.body.innerText);
  console.log('OP .well-known/openid-configuration', JSON.parse(configuration, null, 4));
});
