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

before(clearCookies);

after(async function () {
  await client.close();
});
