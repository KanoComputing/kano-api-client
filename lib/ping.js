import { Client } from './client.js';

const PING_ENDPOINTS = {
    ping() {
        return {
            path: '/ping',
            responseType: 'text',
        };
    },
};

export class PingClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(PING_ENDPOINTS);

        /* The /ping endpoint doesn't work with JSON. Remove these
           to avoid a preflight request being sent by the browser */
        delete this.options.defaultHeaders.Accept;
        delete this.options.defaultHeaders['Content-Type'];
    }

    ping() {
        const endpoint = this.getEndpoint('ping');
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default PingClient;
