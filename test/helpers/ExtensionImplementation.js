import ExtensionBase from '../../src/Extensions/ExtensionBase';

export default class ExtensionImplementation extends ExtensionBase {
    
    createGetCommand(uri, to) {
        return this._createGetCommand(uri, to);
    }

    createSetCommand(uri, type, resource, to) {
        return this._createSetCommand(uri, type, resource, to);
    }

    createDeleteCommand(uri, to) {
        return this._createDeleteCommand(uri, to);
    }

    createMergeCommand(uri, type, resource, to) {
        return this._createMergeCommand(uri, type, resource, to);
    }

    buildResourceQuery(uri, query) {
        return this._buildResourceQuery(uri, query);
    }

    buildUri(uri, ...args) {
        return this._buildUri(uri, ...args);
    }

    processCommand(command) {
        return this._processCommand(command);
    }

}
