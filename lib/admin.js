import { Client } from './client.js';

const ENDPOINTS = {
    updateEmailForUser(id, email) {
        return {
            path: `/admin/accounts/${id}/email`,
            method: 'PUT',
            body: JSON.stringify({ email }),
            responseType: 'text',
        };
    },
    getRoles() {
        return '/admin/roles';
    },
    getFlaggedShares(offset) {
        return `/flagged-shares${offset ? `?offset=${offset}` : ''}`;
    },
    getFlaggedComments(offset) {
        return `/flagged-comments${offset ? `?offset=${offset}` : ''}`;
    },
};

export class AdminClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    updateEmailForUser(id, email) {
        const endpoint = this.getEndpoint('updateEmailForUser', id, email);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getRoles() {
        const endpoint = this.getEndpoint('getRoles');
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getFlaggedShares(offset) {
        const endpoint = this.getEndpoint('getFlaggedShares', offset);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getFlaggedComments(offset) {
        const endpoint = this.getEndpoint('getFlaggedComments', offset);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default AdminClient;
