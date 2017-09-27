'use strict';

import net from 'net';
import Lime from 'lime-js';
import Promise from 'bluebird';

var logger = console.debug || console.log; // eslint-disable-line no-console

export default class TcpTransport {

    constructor(traceEnabled) {
        this._traceEnabled = traceEnabled;
        this._socket = new net.Socket();
        this._socket.on('close', () => this.onClose());
        this._socket.on('end', () => this.onClose());
        this._socket.on('error', () =>  this.onError());
        this._socket.on('data', (e) => {
            if (this._traceEnabled) {
                logger('TcpTransport RECEIVE: ' + e.toString());
            }
            // workaround for mocking tests
            var envelopes = e.toString().replace(/\}\{/g, '}^END${').split('^END$');
            envelopes.forEach((envelope) => this.onEnvelope(JSON.parse(envelope)));
        });
    }

    send(envelope) {
        var envelopeString = JSON.stringify(envelope);
        this._socket.write(envelopeString);
        if (this._traceEnabled) {
            logger('TcpTransport SEND: ' + envelopeString);
        }
    }

    onEnvelope() { }

    open(uri) {
        this.encryption = Lime.SessionEncryption.none;
        this.compression = Lime.SessionCompression.none;

        return new Promise((resolve) => {
            let host = uri.split(':');
            this._socket.connect(host[1], host[0], () => {
                resolve();
                this.onOpen();
            });
        });
    }

    close() {
        let promise = new Promise((resolve) => this._socket.on('close', resolve));
        this._socket.end();
        return promise;
    }

    getSupportedCompression() {
        throw new Error('Compression change is not supported');
    }
    setCompression() {}

    getSupportedEncryption() {
        throw new Error('Encryption change is not supported');
    }
    setEncryption() {}

    onOpen() {}
    onClose() {}
    onError() {}
}
