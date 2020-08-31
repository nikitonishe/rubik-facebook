# rubik-facebook
Facebook's Bot API kubik for the Rubik

## Install

### npm
```bash
npm i rubik-facebook
```

### yarn
```bash
yarn add rubik-facebook
```

## Use
```js
const { App, Kubiks } = require('rubik-main');
const Facebook = require('rubik-facebook');
const path = require('path');

// create rubik app
const app = new App();
// config need for most modules
const config = new Kubiks.Config(path.join(__dirname, './config/'));

const facebook = new Facebook();

app.add([ config, facebook ]);

app.up().
then(() => console.info('App started')).
catch(err => console.error(err));
```

## Config
`facebook.js` config in configs volume may contain the host and token.

If you do not specify a host, then `https://graph.facebook.com/` will be used by default.

If you don't specify a token, you will need to pass it.
```js
...
const response = await app.get('facebook').debug_token();
...
```

You may need the host option if for some reason Facebook host is not available from your server
and you want to configure a proxy server.


For example:
`config/facebook.js`
```js
module.exports = {
  host: 'https://my.facebook.proxy.example.com/'
};
```

## Extensions
Facebook kubik doesn't has any extension.
