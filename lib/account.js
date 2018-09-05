import { Client } from './client.js';

const ACCOUNT_ENDPOINTS = {
    userExists(username) {
        return `/accounts/checkUsernameExists/${username}`;
    },
    login(username, password) {
        return {
            path: '/accounts/auth',
            method: 'POST',
            body: JSON.stringify({ username, password }),
        };
    },
    register(form) {
        const body = Object.assign({ erole: 'notset' }, form);
        return {
            path: '/accounts',
            method: 'POST',
            body: JSON.stringify(body),
        };
    },
};

export class AccountClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ACCOUNT_ENDPOINTS);
    }
    login(username, password) {
        const endpoint = this.getEndpoint('login', username, password);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    register(form) {
        const endpoint = this.getEndpoint('register', form);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    checkUsernameAvailability(username) {
        const endpoint = this.getEndpoint(endpoint, username);
        return this.fetch(endpoint)
            .then(res => !JSON.parse(res.data))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default AccountClient;
