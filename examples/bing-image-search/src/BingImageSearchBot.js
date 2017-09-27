'use strict';

let uuid = require('uuid');
let request = require('request-promise');
let MessagingHubHttpClient = require('./MessagingHubHttpClient');

const MEDIA_TYPES = {
    TEXT_PLAIN: 'text/plain',
    MEDIA_LINK: 'application/vnd.lime.media-link+json'
};
const BING_SERVICE_URI = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search';

class BingImageSearchBot {

    constructor(config) {
        this._bingApiKey = config.settings.bingApiKey;
        this._client = new MessagingHubHttpClient(config.accessKey);
    }

    handleMessage(message) {
        if (message.type !== 'text/plain') {
            return;
        }

        let query = message.content.toString();

        this._searchImage(query)
            .then(data => {
                let response = {
                    id: uuid.v4(),
                    to: message.from
                };

                if (data.value.length === 0) {
                    response.content = `Nenhuma imagem encontrada para o termo '${query}'`;
                    response.type = MEDIA_TYPES.TEXT_PLAIN;
                } else {
                    let image = data.value[0];

                    response.content = {
                        uri: image.contentUrl,
                        type: `image/${image.encodingFormat}`,
                        previewUri: image.thumbnailUrl,
                        previewType: `image/${image.encodingFormat}`,
                        size: parseInt(image.contentSize.match(/\d*/)[0])
                    };
                    response.type = MEDIA_TYPES.MEDIA_LINK;
                }

                return this._client.sendMessage(response);
            });
    }

    _searchImage(query) {
        return request({
            method: 'GET',
            uri: `${BING_SERVICE_URI}?q=${query}&mkt=pt-br`,
            headers: {
                'Ocp-Apim-Subscription-Key': this._bingApiKey
            },
            json: true
        });
    }
}

module.exports = BingImageSearchBot;
