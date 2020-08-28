import { Client } from './client.js';

const ENDPOINTS = {
    // If limit is not specified - the default is 50
    getNotifications(opts) {
        const params = `?${opts.type ? `type=${opts.type}` : ''}${opts.isRead ? `&isRead=${opts.isRead}` : ''}${opts.limit ? `&limit=${opts.limit}` : ''}${opts.offset ? `&offset=${opts.offset}` : ''}`;
        return `/v2/notifications${params}`;
    },
};

export class ActivityClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    getNotifications(opts = {}) {
        const endpoint = this.getEndpoint('getNotifications', opts);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default ActivityClient;
