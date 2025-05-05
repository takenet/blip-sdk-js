import Lime from 'lime-js';
import Application from './Application';
import Promise from 'bluebird';
import ArtificialIntelligenceExtension from './Extensions/ArtificialIntelligence';
import MediaExtension from './Extensions/Media';
import ChatExtension from './Extensions/Chat';

const identity = (x) => x;
const MAX_CONNECTION_TRY_COUNT = 10;

export default class Client {
    // Client :: String -> Transport? -> Client
    constructor(uri, transportFactory, application) {
        let defaultApplication = new Application();

        this._application = {
            ...defaultApplication,
            ...application
        };

        this._messageReceivers = [];
        this._notificationReceivers = [];
        this._commandReceivers = [];
        this._commandResolves = {};
        this.sessionPromise = new Promise(() => { });
        this.sessionFinishedHandlers = [];
        this.sessionFailedHandlers = [];

        this._listening = false;
        this._closing = false;
        this._uri = uri;
        this._connectionTryCount = 0;

        this._transportFactory = typeof transportFactory === 'function' ? transportFactory : () => transportFactory;
        this._transport = this._transportFactory();

        this._initializeClientChannel();

        this._extensions = {};
    }

    // connectWithGuest :: String -> Promise Session
    connectWithGuest(identifier) {
        if (!identifier) throw new Error('The identifier is required');
        this._application.identifier = identifier;
        this._application.authentication = new Lime.GuestAuthentication();
        return this.connect();
    }

    // connectWithPassword :: String -> String -> Promise Session
    connectWithPassword(identifier, password, presence) {
        if (!identifier) throw new Error('The identifier is required');
        if (!password) throw new Error('The password is required');
        this._application.identifier = identifier;
        this._application.authentication = new Lime.PlainAuthentication();
        this._application.authentication.password = password;
        if (presence) this._application.presence = presence;
        return this.connect();
    }

    // connectWithKey :: String -> String -> Promise Session
    connectWithKey(identifier, key, presence) {
        if (!identifier) throw new Error('The identifier is required');
        if (!key) throw new Error('The key is required');
        this._application.identifier = identifier;
        this._application.authentication = new Lime.KeyAuthentication();
        this._application.authentication.key = key;
        if (presence) this._application.presence = presence;
        return this.connect();
    }

    connect() {
        if (this._connectionTryCount >= MAX_CONNECTION_TRY_COUNT) {
            throw new Error(`Could not connect: Max connection try count of ${MAX_CONNECTION_TRY_COUNT} reached. Please check you network and refresh the page.`);
        }

        this._connectionTryCount++;
        this._closing = false;
        return this
            ._transport
            .open(this.uri)
            .then(() => this._clientChannel.establishSession(
                this._application.compression,
                this._application.encryption,
                this._application.identifier + '@' + this._application.domain,
                this._application.authentication,
                this._application.instance))
            .then((session) => this._sendPresenceCommand().then(() => session))
            .then((session) => this._sendReceiptsCommand().then(() => session))
            .then((session) => {
                this.listening = true;
                this._connectionTryCount = 0;
                return session;
            });
    }

    _initializeClientChannel() {
        this._transport.onClose = () => {
            this.listening = false;
            if (!this._closing) {
                // Use an exponential backoff for the timeout
                let timeout = 100 * Math.pow(2, this._connectionTryCount);

                // try to reconnect after the timeout
                setTimeout(() => {
                    if (!this._closing) {
                        this._transport = this._transportFactory();
                        this._initializeClientChannel();
                        this.connect();
                    }
                }, timeout);
            }
        };

        this._clientChannel = new Lime.ClientChannel(this._transport, true, false);
        this._clientChannel.onMessage = (message) => {
            let shouldNotify =
                message.id &&
                (!message.to || this._clientChannel.localNode.substring(0, message.to.length).toLowerCase() === message.to.toLowerCase());

            if (shouldNotify) {
                this.sendNotification({
                    id: message.id,
                    to: message.pp || message.from,
                    event: Lime.NotificationEvent.RECEIVED,
                    metadata: {
                        '#message.to': message.to,
                        '#message.uniqueId': message.metadata ? message.metadata['#uniqueId'] || null : null

                    }
                });
            }

            this._loop(0, shouldNotify, message);
        };

        this._clientChannel.onNotification = (notification) =>
            this._notificationReceivers
                .forEach((receiver) => receiver.predicate(notification) && receiver.callback(notification));

        this._clientChannel.onCommand = (c) => {
            (this._commandResolves[c.id] || identity)(c);
            this._commandReceivers.forEach((receiver) =>
                receiver.predicate(c) && receiver.callback(c));
        };

        this.sessionPromise = new Promise((resolve, reject) => {
            this._clientChannel.onSessionFinished = (s) => {
                resolve(s);
                this.sessionFinishedHandlers.forEach(handler => handler(s));
            };
            this._clientChannel.onSessionFailed = (s) => {
                reject(s);
                this.sessionFailedHandlers.forEach(handler => handler(s));
            };
        });
    }

    _loop(i, shouldNotify, message) {
        try {
            if (i < this._messageReceivers.length) {
                if (this._messageReceivers[i].predicate(message)) {
                    return Promise.resolve(this._messageReceivers[i].callback(message))
                        .then((result) => {
                            return new Promise((resolve, reject) => {
                                if (result === false) {
                                    reject();
                                }
                                resolve();
                            });
                        })
                        .then(() => this._loop(i + 1, shouldNotify, message));
                }
                else {
                    this._loop(i + 1, shouldNotify, message);
                }
            }
            else {
                this._notify(shouldNotify, message, null);
            }
        }
        catch (e) {
            this._notify(shouldNotify, message, e);
        }
    }

    _notify(shouldNotify, message, e) {
        if (shouldNotify && e) {
            this.sendNotification({
                id: message.id,
                to: message.from,
                event: Lime.NotificationEvent.FAILED,
                reason: {
                    code: 101,
                    description: e.message
                }
            });
        }

        if (shouldNotify && this._application.notifyConsumed) {
            this.sendNotification({
                id: message.id,
                to: message.pp || message.from,
                event: Lime.NotificationEvent.CONSUMED,
                metadata: {
                    '#message.to': message.to,
                    '#message.uniqueId': message.metadata ? message.metadata['#uniqueId'] || null : null
                }
            });
        }
    }

    _sendPresenceCommand() {
        if (this._application.authentication instanceof Lime.GuestAuthentication) {
            return Promise.resolve();
        }
        return this.sendCommand({
            id: Lime.Guid(),
            method: Lime.CommandMethod.SET,
            uri: '/presence',
            type: 'application/vnd.lime.presence+json',
            resource: this._application.presence
        });
    }

    _sendReceiptsCommand() {
        if (this._application.authentication instanceof Lime.GuestAuthentication) {
            return Promise.resolve();
        }
        return this.sendCommand({
            id: Lime.Guid(),
            method: Lime.CommandMethod.SET,
            uri: '/receipt',
            type: 'application/vnd.lime.receipt+json',
            resource: {
                events: [
                    'failed',
                    'accepted',
                    'dispatched',
                    'received',
                    'consumed',
                    'deleted'
                ]
            }
        });
    }

    _getExtension(type, to = null) {
        let extension = this._extensions[type];
        if (!extension) {
            extension = new type(this, to);
            this._extensions[type] = extension;
        }
        return extension;
    }

    // close :: Promise ()
    close() {
        this._closing = true;

        if (this._clientChannel.state === Lime.SessionState.ESTABLISHED) {
            return this._clientChannel.sendFinishingSession();
        }

        return Promise.resolve(
            this.sessionPromise
                .then(s => s)
                .catch(s => Promise.resolve(s))
        );
    }

    // sendMessage :: Message -> ()
    sendMessage(message) {
        this._clientChannel.sendMessage(message);
    }

    // sendNotification :: Notification -> ()
    sendNotification(notification) {
        this._clientChannel.sendNotification(notification);
    }

    // sendCommand :: Command -> Number -> Promise Command
    sendCommand(command, timeout = this._application.commandTimeout) {
        const commandPromise = Promise.race([
            new Promise((resolve, reject) => {
                this._commandResolves[command.id] = (c) => {
                    if (!c.status) {
                        reject(new ClientError('Command received without a status'));
                    } else if (c.status === Lime.CommandStatus.SUCCESS) {
                        resolve(c);
                    } else {
                        const cmd = JSON.stringify(c);
                        reject(new ClientError(cmd));
                    }

                    delete this._commandResolves[command.id];
                };
            }),
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!this._commandResolves[command.id]) {
                        resolve('Command already resolved');
                    }

                    delete this._commandResolves[command.id];
                    command.status = 'failure';
                    command.timeout = true;

                    const cmd = JSON.stringify(command);
                    reject(new ClientError(cmd));
                }, timeout);
            })
        ]);

        this._clientChannel.sendCommand(command);
        return commandPromise;
    }

    // processCommand :: Command -> Number -> Promise Command
    processCommand(command, timeout = this._application.commandTimeout) {
        return this._clientChannel.processCommand(command, timeout);
    }

    // addMessageReceiver :: String -> (Message -> ()) -> Function
    addMessageReceiver(predicate, callback) {
        predicate = this.processPredicate(predicate);

        this._messageReceivers.push({ predicate, callback });
        return () => this._messageReceivers = this._messageReceivers.filter(this.filterReceiver(predicate, callback));
    }

    clearMessageReceivers() {
        this._messageReceivers = [];
    }

    // addCommandReceiver :: Function -> (Command -> ()) -> Function
    addCommandReceiver(predicate, callback) {
        predicate = this.processPredicate(predicate);

        this._commandReceivers.push({ predicate, callback });
        return () => this._commandReceivers = this._commandReceivers.filter(this.filterReceiver(predicate, callback));
    }

    clearCommandReceivers() {
        this._commandReceivers = [];
    }

    // addNotificationReceiver :: String -> (Notification -> ()) -> Function
    addNotificationReceiver(predicate, callback) {
        predicate = this.processPredicate(predicate);

        this._notificationReceivers.push({ predicate, callback });
        return () => this._notificationReceivers = this._notificationReceivers.filter(this.filterReceiver(predicate, callback));
    }

    clearNotificationReceivers() {
        this._notificationReceivers = [];
    }

    addSessionFinishedHandlers(callback) {
        this.sessionFinishedHandlers.push(callback);
        return () => this.sessionFinishedHandlers = this.sessionFinishedHandlers.filter(this.filterReceiver(null, callback));
    }

    clearSessionFinishedHandlers() {
        this.sessionFinishedHandlers = [];
    }

    addSessionFailedHandlers(callback) {
        this.sessionFailedHandlers.push(callback);
        return () => this.sessionFailedHandlers = this.sessionFailedHandlers.filter(this.filterReceiver(null, callback));
    }

    clearSessionFailedHandlers() {
        this.sessionFailedHandlers = [];
    }

    processPredicate(predicate) {
        if (typeof predicate !== 'function') {
            if (predicate === true || !predicate) {
                predicate = () => true;
            } else {
                const value = predicate;
                predicate = (envelope) => envelope.event === value || envelope.type === value;
            }
        }

        return predicate;
    }

    filterReceiver(predicate, callback) {
        return r => r.predicate !== predicate && r.callback !== callback;
    }

    get listening() {
        return this._listening;
    }

    set listening(listening) {
        this._listening = listening;
        if (this.onListeningChanged) {
            this.onListeningChanged(listening, this);
        }
    }

    get uri() { return this._uri; }

    get ArtificialIntelligence() {
        return this._getExtension(ArtificialIntelligenceExtension, this._application.domain);
    }

    get Media() {
        return this._getExtension(MediaExtension, this._application.domain);
    }

    get Chat() {
        return this._getExtension(ChatExtension);
    }
}

class ClientError extends Error {
    constructor(message) {
        super();

        this.name = '';
        this.message = message;
    }
}
