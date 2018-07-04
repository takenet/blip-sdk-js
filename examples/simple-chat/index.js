/* eslint-env browser */
/* global utils */
/* global Lime */
/* global WebSocketHttpTransport */
/* global BlipSdk */
(function (window) {
    'use strict';

    // buttons
    var $connectButton = document.getElementById('connect-button');
    var $disconnectButton = document.getElementById('disconnect-button');

    // input elements for connection
    var $identifierInput = document.getElementById('identifier-input');
    var $passwordInput = document.getElementById('password-input');
    var $uriInput = document.getElementById('uri-input');
    var $botIdInput = document.getElementById('bot-id-input');
    // input elements for messages
    var $messageToInput = document.getElementById('message-to-input');
    var $messageContentInput = document.getElementById('message-content-input');
    // input elements for notifications
    var $notificationShow = document.getElementById('notification-show');
    var $notificationIdInput = document.getElementById('notification-id-input');
    var $notificationToInput = document.getElementById('notification-to-input');
    var $notificationEventInput = document.getElementById('notification-event-input');

    //Constants
    var DOMAIN = '0mn.io';

    //
    var blipClient;
    var identity;
    var password;
    var uri;

    function createGuestClient(uri) {

        var scheme = uri.match(/^(\w+):\/\//)[1];
        var hostName = uri.match(/:\/\/([^:\/]+)([:\/]|$)/)[1];
        var port = uri.match(/:(\d+)/);
        port = port ? port[1] : 8081;

        return new BlipSdk.ClientBuilder()
            .withScheme(scheme)
            .withHostName(hostName)
            .withPort(port)
            .withDomain(DOMAIN)
            .withTransportFactory(() => {
                return new WebSocketHttpTransport({
                    localNode: identity
                });
            })
            .build();
    }

    function createClient(uri, identity, password) {

        var scheme = uri.match(/^(\w+):\/\//)[1];
        var hostName = uri.match(/:\/\/([^:\/]+)([:\/]|$)/)[1];
        var port = uri.match(/:(\d+)/);
        port = port ? port[1] : 8081;

        blipClient = new BlipSdk.ClientBuilder()
            .withIdentifier(identity)
            .withPassword(password)
            .withScheme(scheme)
            .withHostName(hostName)
            .withPort(port)
            .withDomain(DOMAIN)
            //.withRoutingRule('promiscuous')
            .withTransportFactory(() => {
                return new WebSocketHttpTransport({
                    localNode: identity
                });
            })
            .build();

        blipClient.addMessageReceiver(null, function (message) {
            utils.logLimeMessage(message, 'Message received');
        });

        blipClient.addNotificationReceiver(null, function (notification) {
            if ($notificationShow.checked) {
                utils.logLimeNotification(notification, 'Notification received');
            }
        });

        setConnectedState();
    }

    function setConnectedState() {
        $connectButton.disabled = true;
        $disconnectButton.disabled = false;
        blipClient.connect()
            .then(function () {
                utils.logMessage('Client connected');
            })
            .catch(function (err) {
                utils.logMessage(err);
            });
    }

    function setDisconnectedState() {
        $connectButton.disabled = false;
        $disconnectButton.disabled = true;
        utils.logMessage('Client disconnected');
    }

    window.connectAsGuest = function () {
        utils.checkMandatoryInput($uriInput);
        utils.checkMandatoryInput($botIdInput);

        uri = $uriInput.value;

        let randomUserIdentifier = Lime.Guid();
        identity = randomUserIdentifier + '.' + $botIdInput.value + '@' + DOMAIN;
        let randomUserPassword = 'MTIzNDU2'; //any base64 string

        let guestIdentifier = Lime.Guid();
        let guestNode = guestIdentifier + '@' + DOMAIN + '/default';
        let guestClient = createGuestClient(uri);
        guestClient.connectWithGuest(guestIdentifier)
            .then(function () {
                utils.logMessage('Client connected as guest');
                //create a new random account for the user

                var createAccountCommand = {
                    id: Lime.Guid(),
                    from: identity,
                    pp: guestNode,
                    method: 'set',
                    type: 'application/vnd.lime.account+json',
                    uri: '/account',
                    resource: {
                        //fullName: "User name",
                        password: randomUserPassword
                    }
                };

                guestClient
                    .sendCommand(createAccountCommand)
                    .then(function (commandResponse) {
                        utils.logLimeCommand(createAccountCommand, 'Create account command sent');
                        utils.logLimeCommand(commandResponse, 'Create account response');

                        createClient(uri, randomUserIdentifier, randomUserPassword);
                    })
                    .catch(function (err) {
                        utils.logMessage('An error occurred: ' + err);
                    });
            })
            .catch(function (err) {
                utils.logMessage(err);
            });
    };

    window.connect = function () {
        utils.checkMandatoryInput($identifierInput);
        utils.checkMandatoryInput($uriInput);

        identity = $identifierInput.value;
        password = $passwordInput.value;
        uri = $uriInput.value;

        createClient(uri, identity, password);
    };

    window.disconnect = function () {
        blipClient.close();
        setDisconnectedState();
    };

    window.sendMessage = function () {
        var message = {
            id: Lime.Guid(),
            to: $messageToInput.value,
            type: 'text/plain',
            content: $messageContentInput.value
        };

        blipClient.sendMessage(message);
        utils.logLimeMessage(message, 'Message sent');
    };

    window.sendNotification = function () {
        var notification = {
            id: $notificationIdInput.value,
            to: $notificationToInput.value,
            event: $notificationEventInput.value
        };

        blipClient.sendNotification(notification);
        utils.logLimeNotification(notification, 'Notification sent');
    };

    window.ping = function () {
        var pingCommand = {
            id: Lime.Guid(),
            uri: '/ping',
            method: 'get'
        };

        blipClient
            .sendCommand(pingCommand)
            .then(function (commandResponse) {
                utils.logLimeCommand(pingCommand, 'Ping sent');
                utils.logLimeCommand(commandResponse, 'Ping response');
            })
            .catch(function (err) {
                utils.logMessage('An error occurred: ' + err);
            });
    };
})(this);
