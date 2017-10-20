const url = require('url');
const { snakeCase } = require('lodash');
const got = require('got');
const fs = require('fs');
const assert = require('assert');
const Mocha = require('mocha');

const mocha = new Mocha();

const cwd = process.cwd();
const {
  ISSUER = 'https://guarded-cliffs-8635.herokuapp.com',
  TEST_HOSTNAME = 'op.certification.openid.net',
  TEST_PROTOCOL = 'https',
} = process.env;
let TEST_PORT;

function testUrl(pathname, { protocol = TEST_PROTOCOL, port = TEST_PORT, hostname = TEST_HOSTNAME } = {}) { // eslint-disable-line
  return url.format({
    protocol,
    port,
    hostname,
    pathname,
  });
}

async function passed(test) {
  const currentUrl = await tab.url();
  assert(currentUrl.endsWith('/display'), `Expected to be on a result screen, got ${currentUrl} instead`);

  const selector = `a[href="${testUrl(test)}"] > button`;
  const status = await tab.evaluate(Function(`return document.querySelector('${selector}').title`));

  assert.equal(status, 'Green', `Expected status to be Green, got ${status}`);
}

async function navigation() {
  await tab.waitForNavigation({
    timeout: 0,
    waitUntil: 'networkidle',
  });
}

async function navigate(destination) {
  await tab.goto(destination, {
    timeout: 0,
    waitUntil: 'networkidle',
  });
}

async function proceed() {
  const href = await tab.evaluate(() => document.links[0].href);
  await navigate(href);
}

async function login(loginValue = 'foo', passwordValue = 'bar') {
  if (await tab.$('input[name=login]')) {
    await tab.type('input[name=login]', loginValue);
    await tab.type('input[name=password]', passwordValue);
  }
  await tab.click('button[type=submit]');
  await navigation();
}

async function clearCookies(resource = `${ISSUER}/.well-known/openid-configuration`) {
  await navigate(resource);

  for (const cookie of await tab.cookies()) {
    await tab.deleteCookie({
      name: cookie.name,
    });
  }
}

async function nointeraction() {
  const test = this.test.title;
  await navigate(testUrl(test));
  await passed(test);
}

async function render(test) {
  await tab.screenshot({
    path: `${test}.png`,
    fullPage: true,
  });
}

async function captureError() {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();

  const body = await tab.evaluate(() => document.body.outerHTML);

  await render(test);
  assert(body.includes('oops! something went wrong'), 'expected body to be an error screen');
  console.log(
    'received expected error screen with',
    JSON.parse(body.substring(body.match(/<pre>/).index + 5, body.match(/<\/pre>/).index)),
  );
}

async function regular() {
  const test = this.test.title;

  await navigate(testUrl(test));
  await login();
  await passed(test);
}

async function clearCaptureView() {
  const test = this.test.title;
  await clearCookies();
  await navigate(testUrl(test));
  await proceed();

  await render(test);
  const body = await tab.evaluate(() => document.body.outerHTML);
  console.log('rendered view h1 says:', body.match(/<h1>(.+)<\/h1>/)[1]);

  await login();
  await passed(test);
}

async function configure(profile) {
  const tag = profile;
  const body = {
    'tool:issuer': ISSUER,
    'tool:tag': tag,
    'tool:register': 'True',
    'tool:discover': 'True',
    'tool:webfinger': 'True',
    'tool:return_type': profile.split('').map((letter) => {
      switch (letter) {
        case 'C':
          return 'code';
        case 'I':
          return 'id_token';
        case 'T':
          return 'token';
        default: {
          throw new Error('invalid profile');
        }
      }
    }).join(' '),
    'tool:webfinger_email': `acct:foobar@${url.parse(ISSUER).hostname}`,
    'tool:webfinger_url': `${ISSUER}/foobar`,
    'tool:acr_values': 'session urn:mace:incommon:iap:bronze',
    'tool:claims_locales': '',
    'tool:enc': 'True',
    'tool:extra': 'True',
    'tool:insecure': 'False',
    'tool:login_hint': 'bob@example.com',
    'tool:none': 'True',
    'tool:profile': '',
    'tool:sig': 'True',
    'tool:ui_locales': '',
  };

  const { body: runCmdBody } = await got.post(testUrl(`/run/${encodeURIComponent(ISSUER)}/${tag}`, {
    port: 60000,
  }), { body, form: true });


  runCmdBody.match(/a href=".+:(\d+)"/);
  TEST_PORT = parseInt(RegExp.$1, 10);
}

async function runSuite(profile) {
  await configure(profile);

  const { body } = await got.get(testUrl());

  mocha.asyncOnly();
  mocha.suite.timeout(60000);

  const files = ['test/wrap.js'];

  body.match(/<li>Version: (.*)<\/li>/);
  console.log('Test Suite Version: ', RegExp.$1);

  body.match(/\(OP-[a-zA-Z+-_]+\)/g).forEach((test) => {
    const name = test.slice(4, -1);
    const [folder, ...file] = name.split('-');
    const fileLocation = `test/${snakeCase(folder)}/${snakeCase(file)}.js`;

    if (!fs.existsSync(fileLocation)) {
      throw new Error(`expecting a test definition in ${cwd}/${fileLocation}`);
    }

    files.push(fileLocation);
  });

  mocha.files = files;

  mocha.run(process.exit);
}

module.exports = {
  navigate,
  captureError,
  clearCaptureView,
  clearCookies,
  login,
  navigation,
  nointeraction,
  passed,
  proceed,
  regular,
  runSuite,
  testUrl,
  render,
};
