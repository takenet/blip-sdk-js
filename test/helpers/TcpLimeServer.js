'use strict';

import net from 'net';
import Promise from 'bluebird';
import Lime from 'lime-js';
import {Sessions, Commands, Messages, Notifications} from './TestEnvelopes';

export default class TcpLimeServer {

    constructor() {
        this._server = net.createServer(this._onConnection.bind(this));
        this._connections = [];

        this.listen = Promise.promisify(this._server.listen, {context: this._server});
        this.close = Promise.promisify((callback) => {
            this._connections.forEach(socket => socket.end());
            this._server.close(callback);
        }, {context: this._server});
    }

    broadcast(envelope) {
        this._connections = this._connections.filter((socket) => {
            try {
                socket.writeJSON(envelope);
            } catch (err) {
                if (socket.writable) {
                    return false;
                }
            }
            return true;
        });
    }

    _onPresenceCommand() {}
    _onReceiptCommand() {}

    _onConnection(socket) {
        socket.writeJSON = (json) => socket.write(JSON.stringify(json));

        this._connections.push(socket);

        socket.on('data', (data) => {
            // workaround for mocking tests
            var envelopes = data.toString().replace(/\}\{/g, '}^END${').split('^END$');
            envelopes.forEach((envelope) => this.onEnvelope(socket, JSON.parse(envelope)));
        });
    }

    onEnvelope(socket, envelope) {
        // Session
        if (Lime.Envelope.isSession(envelope)) {
            switch(envelope.state) {
            case 'new':
                socket.writeJSON(Sessions.authenticating);
                break;
            case 'authenticating':
                if (envelope.authentication.scheme === 'plain' && envelope.authentication.password !== 'MTIzNDU2') {
                    throw new Error(`Invalid password '${envelope.authentication.password}'`);
                } else if (envelope.authentication.scheme === 'key' && envelope.authentication.key !== 'YWJjZGVm') {
                    throw new Error(`Invalid key '${envelope.authentication.key}'`);
                }
                socket.writeJSON(Sessions.established);
                break;
            case 'finishing':
                socket.writeJSON(Sessions.finished);
                break;
            }
        // Command
        } else if (Lime.Envelope.isCommand(envelope)) {
            switch(envelope.uri) {
            case '/presence':
                socket.presence = true;
                this._onPresenceCommand(envelope);
                socket.writeJSON(Commands.presenceResponse(envelope));
                break;
            case '/receipt':
                this._onReceiptCommand(envelope);
                socket.writeJSON(Commands.receiptResponse(envelope));
                break;
            case '/ping':
                socket.writeJSON(Commands.pingResponse(envelope));
                break;
            case '/kill':
                socket.writeJSON(Commands.killResponse(envelope));
                socket.writeJSON(Sessions.finished);
                break;
            case '/killWithFail':
                socket.writeJSON(Commands.killWithFailResponse(envelope));
                socket.writeJSON(Sessions.failed);
                break;
            case '/timeout':
                break;
            default:
                socket.writeJSON(Commands.failureResponse(envelope));
            }
        }
        // Message
        else if (Lime.Envelope.isMessage(envelope)) {
            switch(envelope.content) {
            case 'ping':
                socket.writeJSON(Messages.pong);
                break;
            }
        }
        // Notification
        else if (Lime.Envelope.isNotification(envelope)) {
            // echo back received notifications
            socket.writeJSON(envelope);

            switch(envelope.event) {
            case 'ping':
                socket.writeJSON(Notifications.pong);
                break;
            }
        }

    }
}
