import Lime from 'lime-js';

export default class ExtensionBase {

    constructor(client, to = null) {
        this._client = client;
        this._to = to;
    }

    _createGetCommand(uri, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'get',
            uri: uri
        };

        if (this._to) {
            command.to = this._to;
        }

        return command;
    }

    _createSetCommand(uri, type, resource, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'set',
            uri: uri,
            resource: resource
        };

        if (type) {
            command.type = type;
        }

        if (this._to) {
            command.to = this._to;
        }

        return command;
    }

    _createMergeCommand(uri, type, resource, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'merge',
            uri: uri,
            type: type,
            resource: resource
        };

        if (this._to) {
            command.to = this._to;
        }

        return command;
    }

    _createDeleteCommand(uri, id = null) {
        let command = {
            id: id ? id : Lime.Guid(),
            method: 'delete',
            uri: uri
        };

        if (this._to) {
            command.to = this._to;
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
