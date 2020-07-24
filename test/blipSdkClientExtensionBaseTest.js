'use strict';

/*eslint-env node, mocha */

import ExtensionBase from '../src/Extensions/ExtensionBase';

const TEST_URI = '/test';
const TEST_URI_TEMPLATE = '/test/{0}';
const TEST_TO = 'postmaster@test.ai';
const TEST_TYPE = 'application/vnd.iris.extension.test+json';
const TEST_RESOURCE = {
    name: 'test'
};

require('chai').should();

describe('ExtensionBase', function() {

    beforeEach((done) => {
        this.extension = new ExtensionBase({}, TEST_TO);
        done();
    });

    it('should create GET command', (done) => {

        const command = this.extension
            ._createGetCommand(TEST_URI);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);

        command.should.have.property('id');
        command.should.not.have.property('resource');
        command.method.should.equal('get');

        done();

    });

    it('should creage GET command without \'to\'', (done) => {

        const extension = new ExtensionBase({});
        const command = extension._createGetCommand(TEST_URI);

        command.uri.should.equal(TEST_URI);
        command.should.not.have.property('to');
        command.should.have.property('id');
        command.should.not.have.property('resource');
        command.method.should.equal('get');

        done();

    });

    it('should create DELETE command', (done) => {

        const command = this.extension
            ._createDeleteCommand(TEST_URI);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);

        command.should.have.property('id');
        command.should.not.have.property('resource');
        command.method.should.equal('delete');

        done();

    });

    it('should create SET command', (done) => {

        const command = this.extension
            ._createSetCommand(TEST_URI, TEST_TYPE, TEST_RESOURCE);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);
        command.type.should.equal(TEST_TYPE);
        command.resource.should.equal(TEST_RESOURCE);

        command.should.have.property('id');
        command.should.have.property('resource');
        command.method.should.equal('set');

        done();

    });

    it('should create MERGE command', (done) => {

        const command = this.extension
            ._createMergeCommand(TEST_URI, TEST_TYPE, TEST_RESOURCE);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);
        command.type.should.equal(TEST_TYPE);
        command.resource.should.equal(TEST_RESOURCE);

        command.should.have.property('id');
        command.should.have.property('resource');
        command.method.should.equal('merge');

        done();

    });

    it('should process command, and return items', (done) => {

        const stored_items = [
            'item1',
            'item2'
        ];

        this.extension = new ExtensionBase({
            sendCommand: () => {
                return new Promise(resolve => {
                    resolve({
                        itemType: TEST_TYPE,
                        items: stored_items
                    });
                });
            }
        });

        this.extension._processCommand(
            this.extension._createGetCommand(TEST_URI))
            .then(items => items.should.equal(stored_items))
            .finally(() => done());

    });

    it('should process command, and return nothing', (done) => {

        this.extension = new ExtensionBase({
            sendCommand: () => {
                return new Promise(resolve => resolve());
            }
        });

        this.extension._processCommand(
            this.extension._createDeleteCommand(TEST_URI))
            .then(items => (typeof items).should.equal(typeof undefined))
            .finally(() => done());

    });

    it('should build uri path', (done) => {
        const parameter = (Math.random() * 100).toFixed(0);
        const uri = this.extension._buildUri(TEST_URI_TEMPLATE, parameter);
        uri.should.equal(`${TEST_URI}/${parameter}`);
        done();
    });

    it('should build uri resource query', (done) => {
        const query = {
            skip: 0,
            take: 100,
            deep: true
        };

        const uri = this.extension._buildResourceQuery(TEST_URI, query);
        uri.should.equal(`${TEST_URI}?skip=0&take=100&deep=true`);
        done();
    });

});
