function commandSuccess(envelope) {
    return {
        id: envelope.id,
        method: envelope.method,
        status: 'success'
    };
}

export const Sessions = {
    authenticating: {
        id: '0',
        from: '127.0.0.1:8124',
        state: 'authenticating'
    },
    established: {
        id: '0',
        from: '127.0.0.1:8124',
        state: 'established'
    },
    finished: {
        id: '0',
        from: '127.0.0.1:8124',
        state: 'finished'
    },
    failed: {
        id: '0',
        from: '127.0.0.1:8124',
        state: 'failed',
        reason: {
            code: 11,
            description: 'The session was terminated by the server'
        }
    }
};
export const Commands = {
    pingResponse: commandSuccess,
    presenceResponse: commandSuccess,
    receiptResponse: commandSuccess,
    failureResponse: (envelope) => ({
        id: envelope.id,
        method: envelope.method,
        status: 'failure'
    }),
    killResponse: commandSuccess,
    killWithFailResponse: commandSuccess
};
export const Messages = {
    pong: {
        type: 'text/plain',
        content: 'pong'
    }
};
export const Notifications = {
    pong: {
        event: 'pong'
    }
};
