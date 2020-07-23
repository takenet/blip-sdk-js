import Lime from 'lime-js';

export default class ExtensionBase {

    constructor(client) {
        this._client = client;
    }

    _createGetCommand(uri, to = null, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'get',
            uri: uri
        };

        if (to) {
            command.to = to;
        }

        return command;
    }

    _createSetCommand(uri, type, resource, to = null, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'set',
            uri: uri,
            resource: resource
        };

        if (type) {
            command.type = type;
        }

        if (to) {
            command.to = to;
        }

        return command;
    }

    _createMergeCommand(uri, type, resource, to = null, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'merge',
            uri: uri,
            type: type,
            resource: resource
        };

        if (to) {
            command.to = to;
        }

        return command;
    }

    _createDeleteCommand(uri, to = null, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'delete',
            uri: uri
        };

        if (to) {
            command.to = to;
        }

        return command;
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
        let options = '';

        Object.keys(query).forEach(key => {
            let value = query[key].toString();
            if (value) {
                options += i === 0 ? '?' : '&';
                
                if (Array.isArray(value)) {
                    value = value.concat(',');
                }

                options += `${key}=${value}`;
                i += 1;
            }
        });

        return `${uri}${encodeURI(options)}`;
    }

    _buildUri(uri, ...args) {
        args.forEach((arg, i) => {
            uri = uri.replace(`{${i}}`, encodeURIComponent(arg));
        });

        return uri;
    }

}
