import * as UriTemplates from './UriTemplates';
import * as ContentTypes from './ContentTypes';
import ExtensionBase from '../ExtensionBase';

const POSTMASTER = 'postmaster@msging.net';

export default class Chat extends ExtensionBase {

    constructor(client, to = null) {
        super(client);
        this._to = to ? to : POSTMASTER;
    }

    getThreads(take = 100, messageDate = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.THREADS, {
                    $take: take,
                    messageDate: messageDate
                }),
                this._to));
    }

    getThread(
        identity,
        take = 100,
        after = '',
        messageId = '',
        storageDate = '',
        direction = '',
        decryptContent = false
    ) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.THREAD, identity),
                    {
                        $take: take,
                        after: after,
                        messageId: messageId,
                        storageDate: storageDate,
                        direction: direction,
                        decryptContent: decryptContent
                    }),
                this._to));
    }

    getThreadUnreadMessages(identity) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.THREAD_UNREAD_MESSAGES, identity), this._to));
    }

    setThread(identity, thread) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.THREAD, identity), ContentTypes.THREAD_MESSAGE, thread, this._to));
    }

}