const CDP = require('chrome-remote-interface');
const { clearCookies } = require('./helpers');

let client;

before(async function () {
  client = await CDP();

  const { Page, Runtime, Network } = client;

  await Promise.all([
    Page.enable(),
    Network.enable(),
    Runtime.enable(),
  ]);

  global.Network = Network;
  global.Page = Page;
  global.Runtime = Runtime;
});

before(async function () {
  await clearCookies();
  const { result: { value: configuration } } = await Runtime.evaluate({
    expression: 'document.body.innerText',
  });
  console.log('OP .well-known/openid-configuration', JSON.parse(configuration, null, 4));
});

after(async function () {
  await client.close();
});
