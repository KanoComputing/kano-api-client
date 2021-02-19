import { Client } from './client.js';

const ENDPOINTS = {
    getJamSessions() {
        return {
            path: `/jam-sessions`,
        };
    },
};

export class JamClient extends Client {

    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    getJamSessions() {
        const endpoint = this.getEndpoint('getJamSessions');
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

};

export default JamClient;