'use strict';

/*eslint-env node, mocha */

import Client from '../src/Client';
import TcpTransport from './helpers/TcpTransport';
import TcpLimeServer from './helpers/TcpLimeServer';

require('chai').should();

describe('Client', function () {

    function buildClient(address) {
        return new Client(address || '127.0.0.1:8124', () => new TcpTransport());
    }

    //
    beforeEach((done) => {
        this.server = new TcpLimeServer();
        this.server.listen(8124)
            .then(() => this.client = buildClient())
            .finally(() => done());
    });

    afterEach((done) => {
        this.client.close()
            .then(() => this.server.close())
            .finally(() => done());
    });

    //
    it('should connect returning a promise', (done) => {
        const clientWithoutIdentifier = buildClient();
        clientWithoutIdentifier.connectWithGuest.bind(clientWithoutIdentifier).should.throw(Error);

        this.client.listening.should.equal(false);
        this.client.connectWithGuest('guest').then(() => {
            this.client.listening.should.equal(true);
            done();
        });
    });

    this.timeout(7000);

    it('should reconnect after 5 secs', (done) => {
        this.client.connectWithGuest('guest')
            .then(() => {
                this.client.listening.should.equal(true);
                this.server.close();
                setTimeout(() => {
                    this.client.listening.should.equal(false);
                    this.server.listen(8124)
                        .then(() => {
                            setTimeout(() => {
                                this.client.listening.should.equal(true);
                                done();
                            }, 5000);
                        });
                }, 1000);
            });
    });

    this.timeout(2000);


    it('should connect when creating with transport instance', (done) => {
        this.client = new Client('127.0.0.1:8124', new TcpTransport());
        this.client.listening.should.equal(false);
        this.client.connectWithGuest('guest').then(() => {
            this.client.listening.should.equal(true);
            done();
        });
    });

    it('should connect with plain authentication', (done) => {
        const clientWithoutIdentifier = buildClient();
        clientWithoutIdentifier.connectWithPassword.bind(clientWithoutIdentifier).should.throw(Error);

        const clientWithoutPassword = buildClient();
        clientWithoutPassword.connectWithPassword.bind(clientWithoutPassword, 'test2').should.throw(Error);

        this.client.connectWithPassword('test', 'MTIzNDU2').then(() => done());
    });

    it('should connect with key authentication', (done) => {
        const clientWithoutIdentifier = buildClient();
        clientWithoutIdentifier.connectWithKey.bind(clientWithoutIdentifier).should.throw(Error);

        const clientWithoutKey = buildClient();
        clientWithoutKey.connectWithKey.bind(clientWithoutKey, 'dGVzdHQy').should.throw(Error);

        this.client.connectWithKey('testKey', 'YWJjZGVm').then(() => done());
    });

    it('should automatically send a set presence command when connecting', (done) => {
        this.server._onPresenceCommand = (command) => {
            command.should.eql({
                id: command.id,
                method: 'set',
                uri: '/presence',
                type: 'application/vnd.lime.presence+json',
                resource: {
                    status: 'available',
                    routingRule: 'identity'
                }
            });
            this.server._onPresenceCommand = () => { };
            done();
        };

        this.client.connectWithPassword('test', 'MTIzNDU2');
    });

    it('should automatically send a set receipt command when connecting', (done) => {
        this.server._onReceiptCommand = (command) => {
            command.should.eql({
                id: command.id,
                method: 'set',
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
            this.server._onReceiptCommand = () => { };
            done();
        };

        this.client.connectWithPassword('test', 'MTIzNDU2');
    });

    it('should add and remove message listeners', (done) => {
        let f = () => undefined;
        let g = (x) => x;

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => {
                let remove_f = this.client.addMessageReceiver('application/json', f);
                let remove_g = this.client.addMessageReceiver('application/json', g);

                this.client._messageReceivers[0].callback.should.eql(f);
                this.client._messageReceivers[1].callback.should.eql(g);
                remove_f();
                this.client._messageReceivers[0].callback.should.eql(g);
                remove_g();
                this.client._messageReceivers.should.eql([]);

                done();
            });
    });

    it('should add and remove notification listeners', (done) => {
        let f = () => undefined;
        let g = (x) => x;

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => {
                let remove_f = this.client.addNotificationReceiver('received', f);
                let remove_g = this.client.addNotificationReceiver('received', g);

                this.client._notificationReceivers[0].callback.should.eql(f);
                this.client._notificationReceivers[1].callback.should.eql(g);
                remove_f();
                this.client._notificationReceivers[0].callback.should.eql(g);
                remove_g();
                this.client._notificationReceivers.should.eql([]);

                done();
            });
    });

    it('should call receivers predicates with the received envelope', (done) => {
        this.client.addMessageReceiver((message) => {
            message.type.should.equal('text/plain');
            message.content.should.equal('test');
            return true;
        }, () => {
            this.client.addNotificationReceiver((message) => {
                message.event.should.equal('received');
                return true;
            }, () => {
                this.client.clearMessageReceivers();
                this.client.clearNotificationReceivers();
                done();
            });
            this.server.broadcast({ event: 'received' });
        });

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.server.broadcast({ type: 'text/plain', content: 'test' }));
    });

    it('should create predicate functions from non-function values', (done) => {
        this.client.addMessageReceiver(null, () => {
            this.client.clearMessageReceivers();
            this.client.addNotificationReceiver(null, () => {
                this.client.clearNotificationReceivers();
                this.client.addMessageReceiver('text/plain', () => {
                    this.client.clearMessageReceivers();
                    this.client.addNotificationReceiver('received', () => {
                        this.client.clearNotificationReceivers();
                        done();
                    });
                    this.server.broadcast({ event: 'received' });
                });
                this.server.broadcast({ type: 'text/plain', content: 'test' });
            });
            this.server.broadcast({ event: 'received' });
        });

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.server.broadcast({ type: 'text/plain', content: 'test' }));
    });

    it('should do nothing when receiving unknown messages, notifications or commands', (done) => {
        this.client.addMessageReceiver('sometype', () => false);
        this.client.addNotificationReceiver('sometype', () => false);

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => {
                let message = { type: 'application/unknown', content: 'this looks odd' };
                let notification = { event: 'consumed', content: 'this looks odd' };
                let command = { id: 'no_id_for_this', method: 'get' };

                this.server.broadcast(message);
                this.server.broadcast(notification);
                this.server.broadcast(command);

                done();
            });
    });

    it('should send messages', (done) => {
        let remove = this.client.addMessageReceiver('text/plain', (m) => {
            m.content.should.equal('pong');
            remove();
            done();
        });

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendMessage({ type: 'text/plain', content: 'ping' }));
    });

    it('should send notifications', (done) => {
        let remove = this.client.addNotificationReceiver('pong', () => {
            remove();
            done();
        });

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendNotification({ event: 'ping' }));
    });

    it('should automatically send received notifications for messages', (done) => {
        this.client.addMessageReceiver(() => true, () => true);
        this.client.addNotificationReceiver(n => n.event === 'received' && n.id === '1', () => done());

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.server.broadcast({ id: '1', type: 'text/plain', content: 'test' }));
    });

    it('should automatically send consumed notifications for messages when receiver successfully handles it', (done) => {
        this.client.addMessageReceiver(() => true, () => true);
        this.client.addNotificationReceiver(n => n.event === 'consumed' && n.id === '1', () => done());

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.server.broadcast({ id: '1', type: 'text/plain', content: 'test' }));
    });


    it('should not send consumed notifications for messages when notifyConsumed is false', (done) => {
        this.client._application.notifyConsumed = false;
        this.client.addMessageReceiver(() => true, () => true);
        this.client.addNotificationReceiver(n => n.event === 'consumed' && n.id === '1', () => { throw new Error(); });

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.server.broadcast({ id: '1', type: 'text/plain', content: 'test' }));

        setTimeout(() => done(), 1800);
    });

    it('should automatically send failed notifications for messages when receiver fails to handle it', (done) => {
        this.client.addMessageReceiver(() => true, () => {
            throw new Error('test error');
        });
        this.client.addNotificationReceiver(n => n.event === 'failed' && n.id === '1', (n) => {
            n.reason.code.should.equal(101);
            n.reason.description.should.equal('test error');
            done();
        });

        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.server.broadcast({ id: '1', type: 'text/plain', content: 'test' }));
    });

    it('should send commands and receive a response', (done) => {
        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendCommand({ id: 'test', method: 'get', uri: '/ping' }))
            .then((c) => {
                c.id.should.equal('test');
                c.method.should.equal('get');
                c.status.should.equal('success');
                done();
            });
    });

    it('should reject a command\'s promise when the received status is \'failure\'', (done) => {
        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendCommand({ id: 'test', method: 'set', uri: '/unknown' }))
            .catch((c) => {
                c.status.should.equal('failure');
                done();
            });
    });

    this.timeout(2000);
    it('should send command and receive a timeout', (done) => {
        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendCommand({ id: 'timeout', method: 'get', uri: '/timeout' }, 1000))
            .catch((c) => {
                c.status.should.equal('failure');
                done();
            });
    });

    it('should receive a finished session', (done) => {
        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendCommand({ id: 'test', method: 'set', uri: '/kill' }));

        this.client.sessionPromise
            .then((s) => {
                s.state.should.equal('finished');
                done();
            });
    });

    it('should received a failed session', (done) => {
        this.client
            .connectWithKey('test', 'YWJjZGVm')
            .then(() => this.client.sendCommand({ id: 'test', method: 'set', uri: '/killWithFail' }));

        this.client
            .sessionPromise
            .catch((s) => {
                s.state.should.equal('failed');
                s.reason.code.should.equal(11);
                return this.client.close();
            })
            .then((s) => {
                s.state.should.equal('failed');
                s.reason.code.should.equal(11);
                done();
            });
    });
});
