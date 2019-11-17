const url = require('url');
const { snakeCase } = require('lodash');
const got = require('got');
const fs = require('fs');
const assert = require('assert');
const timekeeper = require('timekeeper');
const Mocha = require('mocha');
const jose = require('jose');

const mocha = new Mocha();

let TEST_PORT;
const {
  ISSUER = 'https://op.panva.cz',
  TEST_HOSTNAME = 'op.certification.openid.net',
  TEST_PROTOCOL = 'https',
} = process.env;

function testUrl(pathname, { protocol = TEST_PROTOCOL, port = TEST_PORT, hostname = TEST_HOSTNAME } = {}) { // eslint-disable-line
  return url.format({
    protocol,
    port,
    hostname,
    pathname,
  });
}

async function passed(test, options = {}) {
  await tab.waitForSelector(`a[href="${testUrl(test)}"] > button[title="Green"]`, options);
}

async function navigation() {
  await tab.waitForNavigation({
    timeout: 0,
    waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
  });

  if (tab.url().endsWith('/authz_cb')) {
    await navigation();
  }
}

function navigate(destination) {
  return tab.goto(destination, {
    timeout: 0,
    waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
  });
}

async function proceed() {
  await tab.waitForSelector('div.jumbotron', { timeout: 0 });
  const href = await tab.evaluate(() => document.links[0].href);
  await navigate(href);
}

async function login(fullflow = true) {
  if (await tab.$('input[name=login]')) {
    await tab.type('input[name=login]', 'foo');
    await tab.type('input[name=password]', 'bar');
    await Promise.all([
      navigation(),
      tab.click('button.login-submit[type=submit]'),
    ]);
  }

  if (!fullflow) return;

  await Promise.all([
    navigation(),
    tab.click('button.login-submit[type=submit]'),
  ]);
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
  if (!('CI' in process.env)) {
    await tab.screenshot({
      path: `${test}.png`,
      fullPage: true,
    });
  }
}

async function captureError() {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();

  const body = await tab.content();

  await render(test);
  assert(body.includes('oops! something went wrong'), 'expected body to be an error screen');
}

async function captureLogoutError() {
  const test = this.test.title;
  await navigate(testUrl(test));
  await login();
  await proceed();

  const body = await tab.content();

  await render(test);
  assert(body.includes('oops! something went wrong'), 'expected body to be an error screen');
}

async function regular() {
  const test = this.test.title;

  await navigate(testUrl(test));
  await login();
  await passed(test);
}

async function logout() {
  const currentUrl = tab.url();
  assert(currentUrl.includes('/session/end?') || currentUrl.endsWith('/session/end'), `Expected to be on a logout prompt, got ${currentUrl} instead`);

  return Promise.all([
    navigation(),
    tab.click('button[autofocus]'),
  ]);
}

async function regularWithLogout() {
  const test = this.test.title;

  await navigate(testUrl(test));
  await login();
  await logout();
  await passed(test);
}

async function logoutNoResult() {
  const test = this.test.title;

  await navigate(testUrl(test));
  await login();
  await proceed();
  await logout();
  await render(test);
}

async function loginCaptureView() {
  const test = this.test.title;
  await clearCookies();
  await navigate(testUrl(test));
  await proceed();

  await render(test);
  await login();
  await passed(test);
}

async function consentCaptureView() {
  const test = this.test.title;
  await clearCookies();
  await navigate(testUrl(test));
  await proceed();

  await login(false);
  await render(test);
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
    'tool:webfinger': 'False',
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
    'tool:webfinger_email': '',
    'tool:webfinger_url': '',
    'tool:acr_values': 'urn:mace:incommon:iap:bronze',
    'tool:claims_locales': '',
    'tool:enc': 'True',
    'tool:extra': 'True',
    'tool:form_post': 'True',
    'tool:insecure': 'False',
    'tool:login_hint': 'bob@example.com',
    'tool:none': 'True',
    'tool:profile': '',
    'tool:sig': 'True',
    'tool:ui_locales': '',
    'tool:session': 'True',
    'tool:front': 'True',
    'tool:back': 'True',
    'tool:rp_init': 'True',
  };

  const { body: responseBody } = await got.post(testUrl(`/run/${encodeURIComponent(ISSUER)}/${tag}`, {
    port: 60000,
  }), { body, form: true });

  responseBody.match(/a href=".+:(\d+)"/);
  TEST_PORT = parseInt(RegExp.$1, 10);
}

async function runSuite(profile) {
  let validJWKS;
  do {
    await configure(profile);
    const { body: jwks } = await got.get(testUrl(`/static/jwks_${TEST_PORT}.json`), {
      json: true,
    });
    try {
      validJWKS = jose.JWKS.asKeyStore(jwks);
    } catch (err) {} // eslint-disable-line no-empty
  } while (!validJWKS);

  const { body, headers: { date } } = await got.get(testUrl());

  timekeeper.travel(new Date(date));

  mocha.asyncOnly();
  mocha.suite.timeout(15000);
  mocha.suite.retries(2);

  const files = ['test/wrap.js'];

  body.match(/<li>Version: (.*)<\/li>/);
  console.log('Test Suite Version: ', RegExp.$1);
  const missing = [];

  body.match(/\(OP-[a-zA-Z+-_]+\)/g).forEach((test) => {
    const name = test.slice(4, -1);
    const [folder, ...file] = name.split('-');
    const fileLocation = `test/${snakeCase(folder)}/${snakeCase(file) || 'index'}.js`;

    if (!fs.existsSync(fileLocation)) {
      missing.push(`${name} -> ${fileLocation}`);
      return;
    }

    files.push(fileLocation);
  });

  console.error('missing test definition files');
  console.error(missing);

  mocha.files = files;

  mocha.run(process.exit);
}

module.exports = {
  captureError,
  clearCookies,
  consentCaptureView,
  captureLogoutError,
  regularWithLogout,
  logout,
  login,
  loginCaptureView,
  navigate,
  logoutNoResult,
  navigation,
  nointeraction,
  passed,
  proceed,
  regular,
  render,
  runSuite,
  testUrl,
};
