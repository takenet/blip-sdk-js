'use strict';

let request = require('request-promise');
const MESSAGES_URL = 'https://msging.net/messages';

class MessagingHubHttpClient {

    constructor(accessKey) {
        this._authHeader = `Key ${accessKey}`;
    }

    sendMessage(message) {
        return request({
            method: 'POST',
            uri: MESSAGES_URL,
            headers: {
                'Content-type': 'application/json',
                'Authorization': this._authHeader
            },
            body: message,
            json: true
        });
    }
}

module.exports = MessagingHubHttpClient;
