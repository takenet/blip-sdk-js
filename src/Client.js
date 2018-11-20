import Lime from 'lime-js';
import Application from './Application';
import Promise from 'bluebird';

const identity = (x) => x;

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

        this._listening = false;
        this._closing = false;
        this._uri = uri;

        this._transportFactory = typeof transportFactory === 'function' ? transportFactory : () => transportFactory;
        this._transport = this._transportFactory();

        this._initializeClientChannel();
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
                return session;
            });
    }

    _initializeClientChannel() {
        this._transport.onClose = () => {
            this.listening = false;
            // try to reconnect in 1 second
            setTimeout(() => {
                if (!this._closing) {
                    this._transport = this._transportFactory();
                    this._initializeClientChannel();
                    this.connect();
                }
            }, 1000);
        };

        this._clientChannel = new Lime.ClientChannel(this._transport, true, false);
        this._clientChannel.onMessage = (message) => {
            let shouldNotify =
                message.id &&
                (!message.to || this._clientChannel.localNode.substring(0, message.to.length) === message.to);

            if (shouldNotify) {
                this.sendNotification({ id: message.id, to: message.from, event: Lime.NotificationEvent.RECEIVED });
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
            this._clientChannel.onSessionFinished = resolve;
            this._clientChannel.onSessionFailed = reject;
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
            this.sendNotification({ id: message.id, to: message.from, event: Lime.NotificationEvent.CONSUMED });
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
                    'consumed'
                ]
            }
        });
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
        this._clientChannel.sendCommand(command);

        return Promise.race([
            new Promise((resolve, reject) => {
                this._commandResolves[command.id] = (c) => {
                    if (!c.status)
                        return;

                    if (c.status === Lime.CommandStatus.SUCCESS) {
                        resolve(c);
                    }
                    else {
                        reject(new Error(JSON.stringify(c)));
                    }

                    delete this._commandResolves[command.id];
                };
            }),
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!this._commandResolves[command.id])
                        return;

                    delete this._commandResolves[command.id];
                    command.status = 'failure';
                    command.timeout = true;
                    reject(new Error(JSON.stringify(command)));
                }, timeout);
            })
        ]);
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
}
