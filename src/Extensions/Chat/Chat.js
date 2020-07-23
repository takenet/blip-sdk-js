import * as UriTemplates from './UriTemplates';
import * as ContentTypes from './ContentTypes';
import ExtensionBase from '../ExtensionBase';

export default class ChatExtension extends ExtensionBase {

    constructor(client) {
        super(client);
    }

    getThreads(take = 100, messageDate = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.THREADS, {
                    $take: take,
                    messageDate: messageDate
                })));
    }

    getThread(
        identity = '',
        take = 100,
        messageId = '',
        storageDate = '',
        direction = '',
        after = ''
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
                        direction: direction
                    })));
    }

    getThreadUnreadMessages(identity) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.THREAD_UNREAD_MESSAGES, identity)));
    }

    setThread(identity, thread) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.THREAD, identity), ContentTypes.THREAD_MESSAGE, thread));
    }

}