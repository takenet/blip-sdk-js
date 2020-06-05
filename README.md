# blip-sdk-js
> Simple BLiP SDK for JavaScript

**This is a work in progress**

[![npm version](https://img.shields.io/npm/v/blip-sdk.svg?style=flat-square)](https://www.npmjs.com/package/blip-sdk)
[![npm downloads](https://img.shields.io/npm/dm/blip-sdk.svg?style=flat-square)](https://www.npmjs.com/package/blip-sdk) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/takenet/blip-sdk-js)
[![Travis branch](https://img.shields.io/travis/rust-lang/rust/master.svg?style=flat-square)](https://travis-ci.org/takenet/blip-sdk-js)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

--------

Read more about BLiP [here](http://blip.ai/)

### Installing

#### Node.js

If you are using `node.js` (or `webpack`), you should install the `blip-sdk` package (via npm) to access the BLiP server:

    npm install --save blip-sdk lime-transport-websocket

#### Browser

If you are developing a web application (for browsers) with "pure" JavaScript, it's possible to import the package from `node_modules` using the `<script>` tag. In this case, other than the `blip-sdk` package, it's also necessary to include the dependencies `lime-js` and `lime-transport-websocket`:

```html
<script src="./node_modules/lime-js/dist/lime.js" type="text/javascript"></script>
<script src="./node_modules/lime-transport-websocket/dist/WebSocketTransport.js" type="text/javascript"></script>
<script src="./node_modules/blip-sdk/dist/blip-sdk.js" type="text/javascript"></script>
```

You can also use [unpkg](https://unpkg.com) to fetch the packages if you are not using `npm` in development:
```html
<script src="https://unpkg.com/lime-js" type="text/javascript"></script>
<script src="https://unpkg.com/lime-transport-websocket" type="text/javascript"></script>
<script src="https://unpkg.com/blip-sdk" type="text/javascript"></script>
```

### Instantiate the BlipSdk Client

You will need an `identifier` and an `access key` to connect a chatbot to **BLiP**. To get them:
- Go to [Painel BLiP](http://portal.blip.ai/) and login;
- Click **Create chatbot**;
- Choose the `Create from scratch` model option;
- Go to **Settings** and click in **Connection Information**;
- Get your bot's `identifier` and `access key`.

In order to instantiate the client use the `ClientBuilder` class informing the `identifier` and `access key`:

```javascript
import * as BlipSdk from 'blip-sdk';
import WebSocketTransport from 'lime-transport-websocket'

// Create a client instance passing the identifier and access key of your chatbot
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

// Connect with the server asynchronously
// Connection will occurr via websocket on the 8081 port
client.connect() // This method returns a 'promise'
    .then(function(session) {
        // Connection success. Now it's possible to send and receive envelopes from the server
        })
    .catch(function(err) { /* Connection failed */ });
```

Each `client` instance represents a server connection and can be reused. To close a connection:

```javascript
client.close()
    .then(function() { /* Disconnection success */ })
    .catch(function(err) { /* Disconnection failed */ });
```

### Receiving

All messages sent to the chatbot are redirected to registered `receivers` of messages and notifications. You can define filters to specify which envelopes will be handled by each receiver.
The following example shows how to add a simple message receiver:

```javascript
client.addMessageReceiver(true, function(message) {
  // Process received message
});
```
The next sample shows how to add a notification receiver with a filter for the `received` event type:

```javascript
client.addNotificationReceiver("received", function(notification) {
  // Process received notifications
});
```

It's also possible to use a custom function as a filter:

Example of a message receiver filtering by the originator:

```javascript
client.addMessageReceiver(message => message.from === "553199990000@0mn.io", function(message) {
  // Process received message
});
```

Each registration of a receiver returns a `handler` that can be used to cancel the registration:

```javascript
var removeJsonReceiver = client.addMessageReceiver("application/json", handleJson);
// ...
removeJsonReceiver();
```

### Sending

It's possible to send notifications and messages only after the session has been stablished.

The following sample shows how to send a message after the connection has been stablished:

```javascript
client.connect()
    .then(function(session) {
      // Once connected it's possible to send messages
      var msg = { type: "text/plain", content: "Hello, world", to: "553199990000@0mn.io" };
      client.sendMessage(msg);
    });
```

The following sample shows how to send a notification after the connection has been stablished:

```javascript
client.connect()
    .then(function(session) {
      // Sending a "received" notification
      var notification = { id: "ef16284d-09b2-4d91-8220-74008f3a5788", to: "553199990000@0mn.io", event: Lime.NotificationEvent.RECEIVED };
      client.sendNotification(notification);
    });
```

## Contributing

For information on how to contribute to this package, please refer to our [Contribution guidelines](https://github.com/takenet/blip-sdk-js/blob/master/CONTRIBUTING.md).
