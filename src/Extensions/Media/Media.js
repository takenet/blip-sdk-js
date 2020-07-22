import * as UriTemplates from './UriTemplates';
import ExtensionBase from '../ExtensionBase';

const POSTMASTER_MEDIA = 'postmaster@media.msging.net';

export default class Media extends ExtensionBase {

    constructor(client, to = null) {
        super(client);
        this._to = to ? to : POSTMASTER_MEDIA;
    }

    getUploadToken(secure = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.MEDIA_UPLOAD, {
                    secure: secure
                }),
                this._to));
    }

    refreshMedia(id) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.REFRESH_MEDIA, id), this._to));
    }

}