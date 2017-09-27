'use strict';

let http = require('http');
let BingImageSearchBot = require('./BingImageSearchBot');
let config = require('../application.json');

const SERVER_PORT = process.env.PORT || 3000;

let bot = new BingImageSearchBot(config);

let server = http.createServer((req, res) => {
    let body = [];
    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => {
        req.body = body;
        handle(req);
        res.end();
    });
});

function handle(req) {
    let message = JSON.parse(req.body.toString());
    if (message) {
        bot.handleMessage(message);
    }
}

server.listen(SERVER_PORT, () => {
    console.log(`Server is listening on port ${SERVER_PORT}`); // eslint-disable-line no-console
});
