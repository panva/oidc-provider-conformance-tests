const path = require('path');
const url = require('url');
const _ = require('lodash');
const got = require('got');
const fs = require('fs');
const assert = require('assert');

const {
  ISSUER = 'https://guarded-cliffs-8635.herokuapp.com',
  TEST_PORT = 60011,
  TEST_HOSTNAME = 'new-op.certification.openid.net',
  TEST_PROTOCOL = 'https',
  TAG = 'guarded-cliffs',
} = process.env;

function testUrl(pathname, { protocol = TEST_PROTOCOL, port = TEST_PORT, hostname = TEST_HOSTNAME } = {}) { // eslint-disable-line
  return url.format({ protocol, port, hostname, pathname });
}

async function passed(test) {
  const { result: { value: pathname } } = await Runtime.evaluate({
    expression: 'window.location.pathname',
  });

  assert.equal(pathname, '/display', 'Expected to be on a result screen');

  const selector = `a[href="${testUrl(test)}"] > img`;
  const { result: { value: status } } = await Runtime.evaluate({
    expression: `document.querySelector('${selector}').alt`,
  });

  assert.equal(status, 'Green', `Expected status to be Green, got ${status}`);
}

function navigation() {
  return new Promise(async (resolve) => {
    await Page.frameStoppedLoading();
    const { result: { value: body } } = await Runtime.evaluate({
      expression: 'document.body.outerHTML',
    });

    if (body.includes('document.forms[0].submit()')) {
      await Page.frameStoppedLoading();
    }

    resolve();
  });
}

async function proceed() {
  const { result: { value: href } } = await Runtime.evaluate({
    expression: 'document.links[0].href',
  });
  await Page.navigate({ url: href });
  await Page.frameStoppedLoading();
}

async function login(loginValue = 'foo', passwordValue = 'bar') {
  const fn = Function(`
    if (!document.forms[0]) return false;
    if (document.forms[0].login) document.forms[0].login.value = '${loginValue}';
    if (document.forms[0].password) document.forms[0].password.value = '${passwordValue}';
    document.forms[0].submit();
  `);

  await Runtime.evaluate({ expression: `(${fn.toString()})();` });
  await navigation();
}

async function navigate(destination) {
  await Page.navigate({ url: destination });
  await Page.frameStoppedLoading();
}

async function clearCookies(resource = `${ISSUER}/.well-known/openid-configuration`) {
  await navigate(resource);
  const { cookies } = await Network.getCookies();

  for (const cookie of cookies) { // eslint-disable-line
    await Network.deleteCookie({ // eslint-disable-line
      cookieName: cookie.name,
      url: resource,
    });
  }
}

async function nointeraction() {
  const test = this.test.title;
  await navigate(testUrl(test));
  await passed(test);
}

async function captureError() {
  const test = this.test.title;
  await navigate(testUrl(test));
  await proceed();

  const { result: { value: body } } = await Runtime.evaluate({
    expression: 'document.body.outerHTML',
  });

  fs.writeFileSync(`${test}.png`, Buffer.from((await Page.captureScreenshot()).data, 'base64'));
  assert(body.includes('oops! something went wrong'), 'expected body to be an error screen');
  console.log('received expected error screen with', // eslint-disable-line no-console
    JSON.parse(body.substring(body.match(/<pre>/).index + 5, body.match(/<\/pre>/).index)));
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

  fs.writeFileSync(`${test}.png`, Buffer.from((await Page.captureScreenshot()).data, 'base64'));
  const { result: { value: body } } = await Runtime.evaluate({
    expression: 'document.body.outerHTML',
  });
  console.log('rendered view h1 says:', body.match(/<h1>(.+)<\/h1>/)[1]); // eslint-disable-line no-console

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
};
