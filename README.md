# blip-sdk-js
> Simple BLiP SDK for JavaScript

**This is a work in progress**

[![npm version](https://img.shields.io/npm/v/blip-sdk.svg?style=flat-square)](https://www.npmjs.com/package/blip-sdk)
[![npm downloads](https://img.shields.io/npm/dm/blip-sdk.svg?style=flat-square)](https://www.npmjs.com/package/blip-sdk) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/takenet/blip-sdk-js)
[![Travis branch](https://img.shields.io/travis/rust-lang/rust/master.svg?style=flat-square)](https://travis-ci.org/takenet/blip-sdk-js)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

--------

See more about BLiP [here](http://blip.ai/)

### Installing

#### Node.js

If you are using `node.js` (or `webpack`), it's necessary to install `blip-sdk` package (via npm) to access the BLiP server.

    npm install --save blip-sdk lime-transport-websocket

#### Browser

If you are using a web application (on browser) with "pure" Javascript is possible to install the package via `npm` using the `<script>` tag. For this case beyond `blip-sdk` package it's necessary install others dependences as the `lime-js` and `lime-transport-websocket` packages:

```html
<script src="./node_modules/lime-js/dist/lime.js" type="text/javascript"></script>
<script src="./node_modules/lime-transport-websocket/dist/WebSocketTransport.js" type="text/javascript"></script>
<script src="./node_modules/blip-sdk/dist/blip-sdk.js" type="text/javascript"></script>
```

You can also use [unpkg](https://unpkg.com) to get the packages if you are not using `npm` on development:
```html
<script src="https://unpkg.com/lime-js" type="text/javascript"></script>
<script src="https://unpkg.com/lime-transport-websocket" type="text/javascript"></script>
<script src="https://unpkg.com/blip-sdk" type="text/javascript"></script>
```


### Instantiate the BlipSdk Client

You will need an `identifier` and a `access key` to connect a chatbot to **BLiP**. To get them:
- Go to [Painel BLiP](http://portal.blip.ai/) and login;
- Click on `Chatbots` and then click on `Create chatbot`;
- Choose `SDK` model option;
- Create your chatbot, then your `identifier` and `access key` will be displayed.

In order to instantiate the client use `ClientBuilder` class informing the `identifier` and `access key`:

```javascript
import * as BlipSdk from 'blip-sdk';
import * as WebSocketTransport from 'lime-transport-websocket'

// Create a client instance passing the identifier and accessKey of your chatbot 
let client = new BlipSdk.ClientBuilder()
    .withIdentifier(IDENTIFIER)
    .withAccessKey(ACCESS_KEY)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

// Connect with server asynchronously
// Connection will occurr via websocket on 8081 port.
client.connect() // This method return a 'promise'.
    .then(function(session) { 
        // Connection success. Now is possible send and receive envelopes from server. */ 
        })  
    .catch(function(err) { /* Connection failed. */ }); 

```

Each `client` instance represent a server connection and can be reused. To close a connection use:

```javascript

client.close()
    .then(function() { /* Disconnection success */ })  
    .catch(function(err) { /* Disconnection failed */ }); 

```

### Receiving

All messages sent to the chatbot are redirected to registered `receivers` of messages and notifications. You also can define filters to each `receiver`.
The following example show how to add a simple message receiver:

```javascript
client.addMessageReceiver(true, function(message) {
  // Process received message
});

```
The next sample show how to add notification receiver with filter to `received` event type:

```javascript
client.addNotificationReceiver("received", function(notification) {
  // Process received notifications
});

```

It's also possible use a custom function as receiver filter:

Example of message receiver with filter of originator:

```javascript
client.addMessageReceiver(function(message) { message.from === "553199990000@0mn.io" }, function(message) {
  // Process received message
});

// Using expression lambda
client.addNotificationReceiver(() => true, function(message) {
  // Process received notifications
});

```

Each registration of receivers return a `handler` that can be used to cancel the registration:

```javascript
var removeJsonReceiver = client.addMessageReceiver("application/json", handleJson);
// ...
removeJsonReceiver();
```

### Sending

It's possible send notifications and messages only after sessions has been stablished.

The following sample show how to send a message after connection has been stablished:

```javascript
client.connect()
    .then(function(session) {
      // After connection is possible send messages
      var msg = { type: "text/plain", content: "Hello, world", to: "553199990000@0mn.io" };
      client.sendMessage(msg);
    });
```

The following sample show how to send a notification after connection has been stablished:

```javascript
client.connect()
    .then(function(session) {
      // Sending "received" notification
      var notification = { id: "ef16284d-09b2-4d91-8220-74008f3a5788", to: "553199990000@0mn.io", event: Lime.NotificationEvent.RECEIVED };
      client.sendNotification(notification);
    });
```

## Contributing

For information on how to contribute to this package, please refer to our [Contribution guidelines](https://github.com/takenet/blip-sdk-js/blob/master/CONTRIBUTING.md).
