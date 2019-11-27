import Lime from 'lime-js';

export default class ExtensionBase {

    constructor(client) {
        this._client = client;
    }

    _createGetCommand(uri, to, id = null) {
        return {
            id: id ? id : Lime.Guid(),
            to: to,
            method: 'get',
            uri: uri
        };
    }

    _createSetCommand(uri, type, resource, to, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            to: to,
            method: 'set',
            uri: uri,
            resource: resource
        };

        if (type) {
            command.type = type;
        }

        return command;
    }

    _createMergeCommand(uri, type, resource, to, id = null) {
        return {
            id: id ? id : Lime.Guid(),
            to: to,
            method: 'merge',
            uri: uri,
            type: type,
            resource: resource
        };
    }

    _createDeleteCommand(uri, to, id = null) {
        return {
            id: id ? id : Lime.Guid(),
            to: to,
            method: 'delete',
            uri: uri
        };
    }

    _processCommand(command) {
        command = {
            ...command,
            id: command.id ? command.id : Lime.Guid()
        };

        return this._client.sendCommand(command)
        .then(response => {

            if (!response) {
                return;
            }

            if (response.itemType && response.items) {
                return response.items;
            }

            return response;

        });
    }

    _buildResourceQuery(uri, query) {
        let i = 0;
        Object.keys(query).forEach(key => {
            const value = query[key].toString();
            if (value) {
                uri += i === 0 ? '?' : '&';
                
                if (Array.isArray(value)) {
                    value = value.concat(',')
                }

                uri += `${key}=${value}`;
                i += 1;
            }
        });

        return encodeURI(uri);
    }

    _buildUri(uri, ...args) {
        args.forEach((arg, i) => {
            uri = uri.replace(`{${i}}`, arg);
        });

        return uri;
    }

}
