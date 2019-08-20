import { Client } from './client.js';

const TASK_ENDPOINTS = {
    sendEmail(type) {
        return {
            path: '/tasks/send-email',
            method: 'POST',
            body: JSON.stringify({ type }),
        };
    },
    getDeleteAccountAuthViaToken() {
        return {
            path: '/tasks/account/delete',
        };
    },
    deleteAccount() {
        return {
            path: '/tasks/account/delete',
            method: 'POST',
            responseType: 'text',
        };
    },
};

export class TaskClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(TASK_ENDPOINTS);
    }

    sendEmail(type) {
        const endpoint = this.getEndpoint('sendEmail', type);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * NOT for use in kit app ui
     * Get delete account auth via token is currently only used on the guardian website
     * @param token One use token provided by the consent email
     * @returns token to be used for account deletion
     */
    getDeleteAccountAuthViaToken(token) {
        const endpoint = this.getEndpoint('getDeleteAccountAuthViaToken');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    deleteAccount(token = null) {
        const endpoint = this.getEndpoint('deleteAccount');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default TaskClient;
