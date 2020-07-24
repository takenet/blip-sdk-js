import * as UriTemplates from './UriTemplates';
import ExtensionBase from '../ExtensionBase';

const POSTMASTER_MEDIA = 'postmaster@media';

export default class MediaExtension extends ExtensionBase {

    constructor(client, domain) {
        super(client, `${POSTMASTER_MEDIA}.${domain}`);
    }

    getUploadToken(secure = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.MEDIA_UPLOAD, {
                    secure: secure
                })));
    }

    refreshMedia(id) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.REFRESH_MEDIA, id)));
    }

}