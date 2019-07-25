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
    forgotPassword(username) {
        return {
            path: '/accounts/forgotPassword',
            method: 'POST',
            body: JSON.stringify(username),
            responseType: 'text',
        };
    },
    forgotUsername(email) {
        return {
            path: '/accounts/forgotUsername',
            method: 'POST',
            body: JSON.stringify(email),
            responseType: 'text',
        };
    },
    updateUsername(username) {
        return {
            path: '/accounts/username',
            method: 'PATCH',
            body: JSON.stringify({ username }),
        };
    },
    updateEmail(email) {
        return {
            path: '/accounts/email',
            method: 'PATCH',
            body: JSON.stringify({ email }),
        };
    },
    deleteEmail() {
        return {
            path: '/accounts/email',
            method: 'DELETE',
        };
    },
    getConsent() {
        return {
            path: '/accounts/consent',
        };
    },
    updateConsent(value) {
        return {
            path: '/accounts/consent',
            method: 'PUT',
            body: JSON.stringify({ value }),
        };
    },
    getDeleteAccountAuth(password) {
        return {
            path: '/accounts/delete',
            method: 'POST',
            body: JSON.stringify({ password }),
        };
    },
    deleteAccount() {
        return {
            path: '/accounts',
            method: 'DELETE',
        };
    }
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
        const endpoint = this.getEndpoint('userExists', username);
        return this.fetch(endpoint)
            .then(res => !JSON.parse(res.data))
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    forgotUsername(email) {
        const endpoint = this.getEndpoint('forgotUsername', email);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    forgotPassword(username) {
        const endpoint = this.getEndpoint('forgotPassword', username);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    updateUsername(username) {
        const endpoint = this.getEndpoint('updateUsername', username);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    updateEmail(email) {
        const endpoint = this.getEndpoint('updateEmail', email);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * Delete email is currently only used on the guardian website
     * @param token Token passed via the account setup email link
     */
    deleteEmail(token) {
        const endpoint = this.getEndpoint('deleteEmail');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${this.token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * Get consent is currently only used on the guardian website
     * @param token Token passed via the account setup email link
     */
    getConsent(token) {
        const endpoint = this.getEndpoint('getConsent');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${this.token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * Update consent is currently only used on the guardian website
     * @param consent Boolean to set consent
     * @param token Token passed via the account setup email link
     */
    updateConsent(consent, token) {
        const endpoint = this.getEndpoint('updateConsent', consent);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${this.token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getDeleteAccountAuth(password) {
        const endpoint = this.getEndpoint('getDeleteAccountAuth', password);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    deleteAccount(token) {
        const endpoint = this.getEndpoint('deleteAccount');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${this.token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default AccountClient;
