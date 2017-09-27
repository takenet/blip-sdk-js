'use strict';

/*eslint-env node, mocha */

import ClientBuilder from '../src/ClientBuilder';
import LimeTransportWebsocket from 'lime-transport-websocket';
import Lime from 'lime-js';

require('chai').should();

describe('ClientBuilder', function () {

    function buildClient() {
        return new ClientBuilder()
            .withDomain('test')
            .withScheme('test')
            .withCompression(Lime.SessionCompression.NONE)
            .withIdentifier(Lime.Guid())
            .withInstance('test')
            .withHostName('127.0.0.1')
            .withEcho(true)
            .withEncryption(Lime.SessionEncryption.NONE)
            .withPort(8126)
            .withNotifyConsumed(false)
            .withTransportFactory(() => new LimeTransportWebsocket())
            .build();
    }

    //
    it('should have client properties from builder', (done) => {
        var client = buildClient();
        client._application.domain.should.equal('test');
        client._application.scheme.should.equal('test');
        client._application.instance.should.equal('test');
        client._application.compression.should.equal('none');
        client._application.encryption.should.equal('none');
        client._application.notifyConsumed.should.equal(false);
        done();
    });
});
