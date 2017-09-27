/* eslint-env browser */
(function(window) {

    var utils = window.utils || {};

    utils.checkMandatoryInput = function(input) {
        if(!input.value) {
            throw new Error('The input element ' + input.id + ' is mandatory.');
        }
        return true;
    };

    var $logTextarea = document.getElementById('log-textarea');
    utils.logMessage = function(message) {
        $logTextarea.value += message + '\n';
    };

    utils.logLimeMessage = function(message, event) {
        utils.logMessage(event + '\nId: ' + message.id + '\nFrom: ' + message.from + '\nTo: ' + message.to + '\nContent: ' + JSON.stringify(message.content) + '\n');
    };

    utils.logLimeNotification = function(notification, event) {
        utils.logMessage(event + '\nId: ' + notification.id + '\nFrom: ' + notification.from + ' \nTo: ' + notification.to + ' \nEvent: ' + notification.event + ' \nReason: ' + JSON.stringify(notification.reason) + '\n');
    };

    utils.logLimeCommand = function(command, event) {
        utils.logMessage(event + '\nId: ' + command.id + '\nFrom: ' + command.from + ' \nTo: ' + command.to + ' \nMethod: ' + command.method + ' \nUri: ' + command.uri + ' \nStatus: ' + command.status + '\n');
    };

    window.utils = utils;
})(this);
