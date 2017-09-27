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
        this._commandResolves = {};
        this.sessionPromise = new Promise(() => {});

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
            var shouldNotify =
                message.id &&
                (!message.to || this._clientChannel.localNode.substring(0, message.to.length) === message.to);
            if (shouldNotify) {
                this.sendNotification({ id: message.id, to: message.from, event: Lime.NotificationEvent.RECEIVED });
            }
            let hasError = this._messageReceivers.some((receiver) => {
                if (receiver.predicate(message)) {
                    try {
                        receiver.callback(message);
                    } catch (e) {
                        if (shouldNotify) {
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

                        return true;
                    }
                }
            });

            if (!hasError && shouldNotify && this._application.notifyConsumed) {
                this.sendNotification({ id: message.id, to: message.from, event: Lime.NotificationEvent.CONSUMED });
            }
        };
        this._clientChannel.onNotification = (notification) =>
            this._notificationReceivers
                .forEach((receiver) => receiver.predicate(notification) && receiver.callback(notification));
        this._clientChannel.onCommand = (c) => (this._commandResolves[c.id] || identity)(c);

        this.sessionPromise = new Promise((resolve, reject) => {
            this._clientChannel.onSessionFinished = resolve;
            this._clientChannel.onSessionFailed = reject;
        });
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
    sendCommand(command, timeout = 3000) {
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
                        reject(c);
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
                    reject(command);
                }, timeout);
            })
        ]);
    }

    // addMessageReceiver :: String -> (Message -> ()) -> Function
    addMessageReceiver(predicate, callback) {
        if (typeof predicate !== 'function') {
            if (predicate === true || !predicate) {
                predicate = () => true;
            } else {
                const value = predicate;
                predicate = (message) => message.type === value;
            }
        }
        this._messageReceivers.push({ predicate, callback });
        return () => this._messageReceivers = this._messageReceivers.filter((r) => r.predicate !== predicate && r.callback !== callback);
    }

    clearMessageReceivers() {
        this._messageReceivers = [];
    }

    // addNotificationReceiver :: String -> (Notification -> ()) -> Function
    addNotificationReceiver(predicate, callback) {
        if (typeof predicate !== 'function') {
            if (predicate === true || !predicate) {
                predicate = () => true;
            } else {
                const value = predicate;
                predicate = (notification) => notification.event === value;
            }
        }
        this._notificationReceivers.push({ predicate, callback });
        return () => this._notificationReceivers = this._notificationReceivers.filter((r) => r.predicate !== predicate && r.callback !== callback);
    }

    clearNotificationReceivers() {
        this._notificationReceivers = [];
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
