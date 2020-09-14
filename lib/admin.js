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
}

export default AdminClient;
