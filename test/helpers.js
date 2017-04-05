const assert = require('assert');
const path = require('path');
const _ = require('lodash');
const got = require('got');

function passed(test) {
  const selector = `a[href="https://op.certification.openid.net:60917/${test}"] > img[alt=Green]`;
  const fn = Function(`return !!document.querySelector('${selector}')`);
  return page.evaluate(fn);
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
  await page.evaluate(function () {
    document.querySelector('a[href*=continue]').click();
  });
  await nav;
}

async function login(loginValue = 'foo', passwordValue = 'bar') {
  const fn = Function(`
    if (document.forms[0].login) document.forms[0].login.value = '${loginValue}';
    if (document.forms[0].password) document.forms[0].password.value = '${passwordValue}';
    document.forms[0].submit();
  `);
  const nav = navigation();
  await page.evaluate(fn);
  await nav;
}

async function nointeraction() {
  const test = this.test.title;
  const nav = navigation();
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await nav;
  assert(await passed(test));
}

async function captureError() {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);
  await proceed();
  await page.render(`${test}.png`);
}

async function regular() {
  const test = this.test.title;
  await page.open(`https://op.certification.openid.net:60917/${test}`);

  await login();
  assert(await passed(test));
}

async function clearCookies(url = 'https://guarded-cliffs-8635.herokuapp.com/.well-known/openid-configuration') {
  await page.open(url);
  await page.clearCookies();
}

async function restart(profile = global.profile) {
  await got.post('https://op.certification.openid.net:60000/restart_test_instance', {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      issuer: 'https://guarded-cliffs-8635.herokuapp.com',
      instance_id: 'Test',
    }),
  });
  return got.post('https://op.certification.openid.net:60917/profile', {
    body: profile,
  });
}

async function runSuite(rtype) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  global.profile = {
    rtype,
    encryption: 'on',
    none: 'on',
    signing: 'on',
    extra: 'on',
  };
  const { body } = await restart();

  const mocha = path.join(process.cwd(), 'node_modules', '.bin', '_mocha');
  const args = [mocha];
  args.push('--bail');
  args.push('--async-only');
  args.push('--timeout');
  args.push('60000');

  args.push('test/wrap.js');

  body.match(/\(OP-[a-zA-Z+-_]+\)/g).forEach((test) => {
    const [folder, ...file] = test.slice(4, -1).split('-');
    args.push(`test/${_.snakeCase(folder)}/${_.snakeCase(file)}.js`);
  });

  args.unshift(process.argv[0]);

  process.argv = args;

  require(mocha); //eslint-disable-line
}

module.exports = {
  captureError,
  clearCookies,
  login,
  navigation,
  nointeraction,
  passed,
  proceed,
  regular,
  restart,
  runSuite,
};

// await page.property('viewportSize', { width: 800, height: 600 });
