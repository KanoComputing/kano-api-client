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
    }

    ping() {
        const endpoint = this.getEndpoint('ping');
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default PingClient;
