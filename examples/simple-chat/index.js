/* eslint-env browser */
/* global utils */
/* global Lime */
/* global WebSocketHttpTransport */
/* global MessagingHub */
(function(window) {
    'use strict';

    // buttons
    var $connectButton = document.getElementById('connect-button');
    var $disconnectButton = document.getElementById('disconnect-button');

    // input elements for connection
    var $identityInput = document.getElementById('identity-input');
    var $passwordInput = document.getElementById('password-input');
    var $uriInput = document.getElementById('uri-input');
    // input elements for messages
    var $messageToInput = document.getElementById('message-to-input');
    var $messageContentInput = document.getElementById('message-content-input');
    // input elements for notifications
    var $notificationIdInput = document.getElementById('notification-id-input');
    var $notificationToInput = document.getElementById('notification-to-input');
    var $notificationEventInput = document.getElementById('notification-event-input');

    //
    var messagingHubClient;
    var identity;
    var password;
    var uri;

    function createClient(uri, identity, password) {

        var scheme = uri.match(/^(\w+):\/\//)[1];
        var hostName = uri.match(/:\/\/([^:\/]+)([:\/]|$)/)[1];
        var port = uri.match(/:(\d+)/);
        port = port ? port[1] : 8081;

        messagingHubClient = new MessagingHub.ClientBuilder()
            .withIdentifier(identity)
            .withPassword(password)
            .withScheme(scheme)
            .withHostName(hostName)
            .withPort(port)
            .withTransportFactory(() => {
                return new WebSocketHttpTransport({
                    localNode: identity
                });
            })
            .build();

        messagingHubClient.addMessageReceiver(null, function (message) {
            utils.logLimeMessage(message, 'Message received');
        });

        messagingHubClient.addNotificationReceiver(null, function (notification) {
            utils.logLimeNotification(notification, 'Notification received');
        });

        setConnectedState();
    }

    function setConnectedState() {
        $connectButton.disabled = true;
        $disconnectButton.disabled = false;
        messagingHubClient.connect()
            .then(function() {
                utils.logMessage('Client connected');
            })
            .catch(function(err) {
                utils.logMessage(err);
            });
    }

    function setDisconnectedState() {
        $connectButton.disabled = false;
        $disconnectButton.disabled = true;
        utils.logMessage('Client disconnected');
    }

    window.connect = function () {
        utils.checkMandatoryInput($identityInput);
        utils.checkMandatoryInput($uriInput);

        identity = $identityInput.value;
        password = $passwordInput.value;
        uri = $uriInput.value;

        createClient(uri, identity, password);
    };

    window.disconnect = function () {
        messagingHubClient.close();
        setDisconnectedState();
    };

    window.sendMessage = function () {
        var message = {
            id: Lime.Guid(),
            to: $messageToInput.value,
            type: 'text/plain',
            content: $messageContentInput.value
        };

        messagingHubClient.sendMessage(message);
        utils.logLimeMessage(message, 'Message sent');
    };

    window.sendNotification = function () {
        var notification = {
            id: $notificationIdInput.value,
            to: $notificationToInput.value,
            event: $notificationEventInput.value
        };

        messagingHubClient.sendNotification(notification);
        utils.logLimeNotification(notification, 'Notification sent');
    };

    window.ping = function () {
        var pingCommand = {
            id: Lime.Guid(),
            uri: '/ping',
            method: 'get'
        };

        messagingHubClient
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
