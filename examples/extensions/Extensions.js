/* eslint-disable no-console */

export const RunScheduler = async (client, message) => {
    //Scheduling a message to the 2016-07-25 17:50 GMT 0 date
    client.sendCommand({
        'id': '1', //unique id
        'to': 'postmaster@scheduler.msging.net',
        'method': 'set',
        'uri': '/schedules',
        'type': 'application/vnd.iris.schedule+json',
        'resource': {
            'message': {
                'id': 'ad19adf8-f5ec-4fff-8aeb-2e7ebe9f7a67',
                'to': message.from,
                'type': 'text/plain',
                'content': 'Scheduling test'
            },
            'when': new Date().toJSON()
        }
    });

    //Getting an existing scheduled message
    let scheduledMessage = await client.sendCommand({
        'id': '1',
        'to': 'postmaster@scheduler.msging.net',
        'method': 'get',
        'uri': '/schedules/ad19adf8-f5ec-4fff-8aeb-2e7ebe9f7a67'
    });

    console.log(scheduledMessage);
};

export const RunBroadcast = async (client, message) => {
    //Creating distribution list
    await client.sendCommand({
        'id': '1',
        'to': 'postmaster@broadcast.msging.net',
        'method': 'set',
        'type': 'application/vnd.iris.distribution-list+json',
        'uri': '/lists',
        'resource': {
            'identity': 'your_distributionList@broadcast.msging.net'
        }
    });

    //Adding a member to the existing distribution list
    await client.sendCommand({
        'id': '2',
        'to': 'postmaster@broadcast.msging.net',
        'method': 'set',
        'uri': '/lists/your_distributionList@broadcast.msging.net/recipients',
        'type': 'application/vnd.lime.identity',
        'resource': message.from //user identity
    });

    //Sending a message to the distribution list
    await client.sendCommand({
        'id': '4',
        'to': 'your_distributionList@broadcast.msging.net',
        'type': 'text/plain',
        'content': 'Hello participants of this list!'
    });

    //Sending a message with a replacement variable
    await client.sendCommand({
        'id': '5',
        'to': 'your_distributionList@broadcast.msging.net',
        'type': 'text/plain',
        'content': 'Hello ${contact.name}, come to check out our prices!'
    });

    //Removing a member from the existing distribution list
    await client.sendCommand({
        'id': '3',
        'to': 'postmaster@broadcast.msging.net',
        'method': 'delete',
        'uri': '/lists/your_distributionList@broadcast.msging.net/recipients/user_identity@0mn.io'
    });
};

export const RunBucket = async (client) => {
    //Storing an generic JSON document with the xyz1234 identifier:
    await client.sendCommand({
        'id': '1',
        'method': 'set',
        'uri': '/buckets/xyz1234',
        'type': 'application/json',
        'resource': {
            'key1': 'value1',
            'key2': 2,
            'key3': [
                '3a', '3b', '3c'
            ]
        }
    });
};

export const RunDirectory = async (client) => {
    //Getting information about the client 1042221589186385@messenger.gw.msging.net on Messenger
    await client.sendCommand({
        'id': '1',
        'to': 'postmaster@messenger.gw.msging.net',
        'method': 'get',
        'uri': 'lime://messenger.gw.msging.net/accounts/1042221589186385'
    });

    //Getting information about the client 255600202@telegram.gw.msging.net on Telegram
    await client.sendCommand({
        'id': '2',
        'to': 'postmaster@telegram.gw.msging.net',
        'method': 'get',
        'uri': 'lime://telegram.gw.msging.net/accounts/255600202'
    });
};

export const RunEventsAnalysis = async (client) => {
    //Registering an event
    await client.sendCommand({
        'id': '9494447a-2581-4597-be6a-a5dff33af156',
        'method': 'set',
        'type': 'application/vnd.iris.eventTrack+json',
        'uri': '/event-track',
        'resource': {
            'category': 'billing',
            'action': 'payment'
        }
    });

    //Registering an event passing identity
    await client.sendCommand({
        'id': '9494447a-2581-4597-be6a-a5dff33af156',
        'method': 'set',
        'type': 'application/vnd.iris.eventTrack+json',
        'uri': '/event-track',
        'resource': {
            'category': 'billing',
            'action': 'payment',
            'identity': '123456@messenger.gw.msging.net'
        }
    });

    //Retrieving stored event categories
    await client.sendCommand({
        'id': '3',
        'method': 'get',
        'uri': '/event-track'
    });

    //Retrieving event counters
    await client.sendCommand({
        'id': '4',
        'method': 'get',
        'uri': '/event-track/billing?startDate=2016-01-01&$take=10'
    });

    //Retrieving the event details for a category and action
    await client.sendCommand({
        'id': '5',
        'method': 'get',
        'uri': '/event-track/billing/payment?startDate=2016-01-01&$take=10'
    });
};

export const RunResources = async (client) => {
    //Storing a resource of type media link with the key xyz1234
    await client.sendCommand({
        'id': '1',
        'method': 'set',
        'uri': '/resources/xyz1234',
        'type': 'application/vnd.lime.media-link+json',
        'resource': {
            'title': 'Cat',
            'text': 'Here is a cat image for you!',
            'type': 'image/jpeg',
            'uri': 'http://2.bp.blogspot.com/-pATX0YgNSFs/VP-82AQKcuI/AAAAAAAALSU/Vet9e7Qsjjw/s1600/Cat-hd-wallpapers.jpg',
            'size': 227791,
            'previewUri': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS8qkelB28RstsNxLi7gbrwCLsBVmobPjb5IrwKJSuqSnGX4IzX',
            'previewType': 'image/jpeg'
        }
    });

    //Storing a resource of type text/plain with the key help-message
    await client.sendCommand({
        'id': '2',
        'method': 'set',
        'uri': '/resources/help-message',
        'type': 'text/plain',
        'resource': 'To use our services, please send a text message.'
    });

    //Storing a resource of type text/plain with a replacement variable
    await client.sendCommand({
        'id': '3',
        'method': 'set',
        'uri': '/resources/welcome-message',
        'type': 'text/plain',
        'resource': 'Welcome to our service, ${contact.name}!'
    });

    //Storing a resource of type text/plain with the key help-message
    await client.sendCommand({
        'id': '2',
        'method': 'set',
        'uri': '/resources/help-message',
        'type': 'text/plain',
        'resource': 'To use our services, please send a text message.'
    });

    //Storing a resource of type text/plain with a replacement variable
    await client.sendCommand({
        'id': '3',
        'method': 'set',
        'uri': '/resources/welcome-message',
        'type': 'text/plain',
        'resource': 'Welcome to our service, ${contact.name}!'
    });
};
