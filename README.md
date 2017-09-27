# blip-sdk-js
> Simple BLiP SDK for JavaScript

**This is a work in progress**

[![bitHound Overall Score](https://www.bithound.io/github/takenet/blip-sdk-js/badges/score.svg)](https://www.bithound.io/github/takenet/blip-sdk-js)
[![npm version](https://img.shields.io/npm/v/blip-sdk.svg?style=flat-square)](https://www.npmjs.com/package/blip-sdk)
[![npm downloads](https://img.shields.io/npm/dm/blip-sdk.svg?style=flat-square)](https://www.npmjs.com/package/blip-sdk) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/takenet/blip-sdk-js)
[![Travis branch](https://img.shields.io/travis/rust-lang/rust/master.svg?style=flat-square)](https://travis-ci.org/takenet/blip-sdk-js)
[![huBoard](https://img.shields.io/badge/board-tasks-green.svg?style=flat-square)](https://huboard.com/takenet/blip-sdk-js/#/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![codecov.io](https://codecov.io/github/takenet/blip-sdk-js/coverage.svg?branch=develop)](https://codecov.io/github/takenet/blip-sdk-js?branch=develop)

--------

![codecov.io](https://codecov.io/github/takenet/blip-sdk-js/branch.svg?branch=develop)

See more about BLiP [here](http://blip.ai/)

## How to use
If you are using node.js (or webpack), simply install the `blip-sdk` package from the npm registry.

    npm install --save blip-sdk lime-transport-websocket

However, if you're building for the browser and using vanilla JavaScript, you can install the package via npm and then include the distribution script via a `<script>` tag. Note also, that in order to use `blip-sdk` with this setting you must also install and use the `lime-js` library:
```html
<script src="./node_modules/lime-js/dist/lime.js" type="text/javascript"></script>
<script src="./node_modules/blip-sdk/dist/blip-sdk.js" type="text/javascript"></script>
<script src="./node_modules/lime-transport-websocket/WebSocketTransport.js" type="text/javascript"></script>
```

Or you can also use the script served by [unpkg](https://unpkg.com):
```html
<script src="https://unpkg.com/lime-js" type="text/javascript"></script>
<script src="https://unpkg.com/blip-sdk" type="text/javascript"></script>
<script src="https://unpkg.com/lime-transport-websocket" type="text/javascript"></script>
```

### Instantiate the BlipSdk Client
```javascript
import * as BlipSdk from 'blip-sdk';
import * as WebSocketTransport from 'lime-transport-websocket'

let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();
```

#### Transport packages

The BlipSdk class uses transport classes defined according to the Lime procotol specification from the [lime-js](https://github.com/takenet/lime-js) package. There are a few official packages for Lime transport classes publicly available on NPM and on our [Github](https://github.com/takenet), but we plan on building more transport classes for node.js and the browser:
- [WebSocketTransport](https://github.com/takenet/lime-transport-websocket)

In order to use these transport classes in your project you must also include their script files using either npm or unpkg (refer to the [How to use](#how-to-use) section).

### Connect
```javascript
client.connectWithKey(identifier, key).then(/* handle connection */);
```

### Sending
In order to ensure a connection is available and have no runtime exceptions,
one must send messages only after the connection has been established, that is,
all sending logic must be written inside the promise handler for the connection method,
as shown in the examples below:

#### Sending messages
```javascript
client.connectWithKey(identifier, key)
    .then(function(session) {
      // send a message to some user
      var msg = { type: "application/json", content: "Hello, world", to: "my@friend.com" };
      client.sendMessage(msg);
    });
```

#### Sending notifications
```javascript
client.connectWithKey(identifier, key)
    .then(function(session) {
      // send a "received" notification to some user
      var notification = { to: "my@friend.com", event: Lime.NotificationEvent.RECEIVED };
      client.sendNotification(notification);
    });
```

#### Sending commands
```javascript
client.connectWithKey(identifier, key)
    .then(function(session) {
      // send a message to some user
      var command = { uri: "/ping", method: Lime.CommandMethod.GET };
      client.sendCommand(command);
    });
```

### Receiving
#### Add receivers
```javascript
client.addMessageReceiver("application/json", function(message) {
  // do something
});

client.addNotificationReceiver("received", function(notification) {
  // show something
});
```

#### Remove receivers
The client.addMessageReceiver and client.addNotificationReceiver methods return each a function which, when called, cancels the receiver subscription:

```javascript
var removeJsonReceiver = client.addMessageReceiver("application/json", handleJson);
// ...
removeJsonReceiver();
```

#### Receiving command answers
Unlike messages and notifications, when command is sent, the response is received when the promise is complete. This response will contain information about the result of the execution of the command sent.

```javascript
var command = { uri: "/ping", method: Lime.CommandMethod.GET };
client.sendCommand(command)
    .then(function(response) {
        // handle command repsonse
    });
```

## Contributing

For information on how to contribute to this package, please refer to our [Contribution guidelines](https://github.com/takenet/blip-sdk-js/blob/master/CONTRIBUTING.md).
