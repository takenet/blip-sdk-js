'use strict';

/*eslint-env node, mocha */

import ExtensionImplementation from './helpers/ExtensionImplementation';

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
        this.extension = new ExtensionImplementation();
        done();
    });

    it('should create GET command', (done) => {

        const command = this.extension
            .createGetCommand(TEST_URI, TEST_TO);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);

        command.should.have.property('id');
        command.should.not.have.property('resource');
        command.method.should.equal('get');

        done();

    });

    it('should create DELETE command', (done) => {

        const command = this.extension
            .createDeleteCommand(TEST_URI, TEST_TO);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);

        command.should.have.property('id');
        command.should.not.have.property('resource');
        command.method.should.equal('delete');

        done();

    });

    it('should create SET command', (done) => {

        const command = this.extension
            .createSetCommand(TEST_URI, TEST_TYPE, TEST_RESOURCE, TEST_TO);

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
            .createMergeCommand(TEST_URI, TEST_TYPE, TEST_RESOURCE, TEST_TO);

        command.uri.should.equal(TEST_URI);
        command.to.should.equal(TEST_TO);
        command.type.should.equal(TEST_TYPE);
        command.resource.should.equal(TEST_RESOURCE);

        command.should.have.property('id');
        command.should.have.property('resource');
        command.method.should.equal('merge');

        done();

    });

    it('should build uri path', (done) => {
        const parameter = (Math.random() * 100).toFixed(0);
        const uri = this.extension.buildUri(TEST_URI_TEMPLATE, parameter);
        uri.should.equal(`${TEST_URI}/${parameter}`);
        done();
    });

    it('should build uri resource query', (done) => {
        const query = {
            skip: 0,
            take: 100,
            deep: true
        };

        const uri = this.extension.buildResourceQuery(TEST_URI, query);
        uri.should.equal(`${TEST_URI}?skip=0&take=100&deep=true`);
        done();
    });

});
