import { Client } from './client.js';

const ENDPOINTS = {
    startClubTrial() {
        return {
            path: '/club/trial',
            method: 'POST',
        };
    },
    getPromoCode(code) {
        return {
            path: `/club/promo-codes/${code}`,
            method: 'GET',
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
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getPromoCode(code) {
        const endpoint = this.getEndpoint('getPromoCode', code);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default ClubClient;
