import { Client } from './client.js';

const ENDPOINTS = {
    startClubTrial() {
        return {
            path: '/club/trial',
            method: 'POST',
        };
    },
};

export class ClubClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    startClubTrial() {
        const endpoint = this.getEndpoint('startClubTrial');
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default ClubClient;
