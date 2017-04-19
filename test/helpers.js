const path = require('path');
const url = require('url');
const _ = require('lodash');
const got = require('got');

const {
  ISSUER = 'https://guarded-cliffs-8635.herokuapp.com',
  TEST_PORT = 60004,
  TEST_HOSTNAME = 'new-op.certification.openid.net',
  TEST_PROTOCOL = 'https',
  TAG = 'guarded-cliffs',
} = process.env;

function testUrl(pathname, { protocol = TEST_PROTOCOL, port = TEST_PORT, hostname = TEST_HOSTNAME } = {}) { // eslint-disable-line
  return url.format({ protocol, port, hostname, pathname });
}

async function clearCookies(resource = `${ISSUER}/.well-known/openid-configuration`) {
  await page.open(resource);
  await page.clearCookies();
}

async function passed(test) {
  const selector = `a[href="${testUrl(test)}"] > img`;
  const fn = Function(`
    const img = document.querySelector('${selector}');
    if (img) {
      return img.alt;
    } else {
      return "no status found";
    }
    `);
  const alt = await page.evaluate(fn);
  if (alt !== 'Green') throw new Error(`expected status to be Green, but got "${alt}"`);
}

function navigation() {
  return new Promise((resolve) => {
    page.on('onLoadFinished', async function () {
      if ((await page.property('content')).includes('document.forms[0].submit()')) {
        return; // wait for the next onLoadFinished on resubmittions
      }
      await page.off('onLoadFinished');
      resolve();
    });
  });
}

async function proceed() {
  const nav = navigation();
  const clicked = await page.evaluate(function () {
    const link = document.querySelector('a[href*=continue]');
    if (link) {
      return link.click();
    }
    return false;
  });
  if (clicked === false) throw new Error('expected continue link to be present');
  await nav;
}

async function login(loginValue = 'foo', passwordValue = 'bar') {
  const fn = Function(`
    if (!document.forms[0]) return false;
    if (document.forms[0].login) document.forms[0].login.value = '${loginValue}';
    if (document.forms[0].password) document.forms[0].password.value = '${passwordValue}';
    document.forms[0].submit();
  `);
  const nav = navigation();
  const clicked = await page.evaluate(fn);
  if (clicked === false) throw new Error('expected a form to be present');
  await nav;
}

async function nointeraction() {
  const test = this.test.title;
  const nav = navigation();
  await page.open(testUrl(test));
  await nav;
  await passed(test);
}

async function captureError() {
  const test = this.test.title;
  await page.open(testUrl(test));
  await proceed();
  await page.render(`${test}.png`);
}

async function regular() {
  const test = this.test.title;
  await page.open(testUrl(test));

  await login();
  await passed(test);
}

async function clearCaptureView() {
  const test = this.test.title;
  await clearCookies();
  await page.open(testUrl(test));
  await proceed();
  await page.render(`${test}.png`);
  await login();

  await passed(test);
}

async function configure(type) {
  const body = {
    'tool:issuer': ISSUER,
    'tool:tag': TAG,
    'tool:register': 'True',
    'tool:discover': 'True',
    'tool:webfinger': 'True',
    'tool:return_type': type,
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

  await got.post(testUrl(`/run/${encodeURIComponent(ISSUER)}/${TAG}`, {
    protocol: 'http',
    port: 60000,
  }), { body });
}

async function runSuite(profile) {
  const responseType = profile.split('').map((letter) => { // eslint-disable-line
    switch (letter) { // eslint-disable-line
      case 'C': return 'code';
      case 'I': return 'id_token';
      case 'T': return 'token';
    }
  }).join(' ');

  await configure(responseType);

  const { body } = await got.get(testUrl());
  const mocha = path.join(process.cwd(), 'node_modules', '.bin', '_mocha');
  const args = [mocha];
  args.push('--async-only');
  args.push('--timeout');
  args.push('60000');

  args.push('test/wrap.js');

  body.match(/\(OP-[a-zA-Z+-_]+\)/g).forEach((test) => {
    const name = test.slice(4, -1);
    const [folder, ...file] = name.split('-');
    args.push(`test/${_.snakeCase(folder)}/${_.snakeCase(file)}.js`);
  });

  args.unshift(process.argv[0]);

  process.argv = args;

  require(mocha); //eslint-disable-line
}

module.exports = {
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
};
