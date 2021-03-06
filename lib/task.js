import { Client } from './client.js';

const TASK_ENDPOINTS = {
    resendConsentEmail() {
        return {
            path: '/tasks/email/resend-consent',
            method: 'POST',
            responseType: 'text',
        };
    },
    resendVerifyEmail(app) {
        return {
            path: '/tasks/email/resend-verify',
            method: 'POST',
            responseType: 'text',
            body: JSON.stringify({ app }),
        };
    },
    sendJoinClubEmail() {
        return {
            path: '/tasks/email/send-guardian-club-join-request',
            method: 'POST',
            responseType: 'json',
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

    resendConsentEmail(type) {
        const endpoint = this.getEndpoint('resendConsentEmail', type);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    resendVerifyEmail(app) {
        const endpoint = this.getEndpoint('resendVerifyEmail', app);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    sendJoinClubEmail(type) {
        const endpoint = this.getEndpoint('sendJoinClubEmail', type);
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
