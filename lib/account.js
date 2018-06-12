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
        const name = 'login';
        return this.fetch(this.getEndpoint(name, username, password))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    register(form) {
        const name = 'register';
        return this.fetch(this.getEndpoint(name, form))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    checkUsernameAvailability(username) {
        const name = 'userExists';
        return this.fetch(this.getEndpoint(name, username))
            .then(res => !JSON.parse(res.data))
            .then(data => this.afterSuccess(name, data));
    }
}

export default AccountClient;
