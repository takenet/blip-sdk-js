import Lime from 'lime-js';

/* istanbul ignore next */
export default class Application {
    constructor() {
        // Default values
        this.identifier = Lime.Guid();
        this.compression = Lime.SessionCompression.NONE;
        this.encryption = Lime.SessionEncryption.NONE;
        this.instance = 'default';
        this.domain = 'msging.net';
        this.scheme = 'wss';
        this.hostName = 'msging.net';
        this.port = 8081;
        this.presence = {
            status: 'available',
            routingRule: 'identity'
        };
        this.notifyConsumed = true;
        this.authentication = new Lime.GuestAuthentication();
    }
}
