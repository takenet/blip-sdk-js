/* eslint-disable no-console */

import { ClientBuilder } from 'blip-sdk';
import WebSocketTransport from 'lime-transport-websocket';
import {
    RunScheduler,
    RunBroadcast,
    RunBucket,
    RunDirectory,
    RunResources,
    RunEventsAnalysis
} from './Extensions';

const identifier = 'samuel'; //Your identifier key
const accessKey = 'QURPODV0VVREd2VvN2VzZXlVUTI='; //Your access key

let client = new ClientBuilder()
    .withIdentifier(identifier)
    .withAccessKey(accessKey)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

// Register a receiver for messages of 'text/plain' type
client.addMessageReceiver('text/plain', message => {
    //Scheduler extension
    RunScheduler(client, message);

    //Broadcast
    RunBroadcast(client, message);

    //Bucket 
    RunBucket(client, message);

    //Directory
    RunDirectory(client, message);

    //Events Analysis
    RunEventsAnalysis(client, message);

    //Resources
    RunResources(client, message);
});

// Register a receiver to any notification
client.addNotificationReceiver(true, notification => {
    // TODO: Proccess the received notification
    console.log(notification);
});

try {
    (async () => {
        let session = await client.connect();
        console.log(session);
    })();
}
catch (err) {
    throw err;
}
