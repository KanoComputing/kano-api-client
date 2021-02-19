import { Client } from './client.js';

const ENDPOINTS = {
    getJamSessions() {
        return {
            path: '/jam-sessions',
        };
    },
    joinLobby(jamSessionId) {
        return {
            path: `/jam-sessions/${jamSessionId}/join`,
            method: 'POST',
        };
    },
};

export class JamsClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    getJamSessions() {
        const endpoint = this.getEndpoint('getJamSessions');
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    joinLobby(jamSessionId, token) {
        const endpoint = this.getEndpoint('joinLobby', jamSessionId);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default JamsClient;
