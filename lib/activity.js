import { Client } from './client.js';

const ENDPOINTS = {
    getNotifications(type, isRead = false, limit = 50, offset) {
        return `/v2/notifications?type=${type}&isRead=${isRead}&limit=${limit}&offset=${offset}`;
    },
};

export class ActivityClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    getNotifications(type, isRead, limit, offset) {
        const endpoint = this.getEndpoint('getNotifications', type, isRead, limit, offset);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default ActivityClient;
