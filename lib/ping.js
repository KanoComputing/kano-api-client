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
        return this.fetch(this.getEndpoint('ping'))
            .then(data => this.afterSuccess(name, data));
    }
}

export default PingClient;
