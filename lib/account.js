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
            method: 'PUT',
            body: JSON.stringify({ username }),
            responseType: 'text',
        };
    },
    updatePassword(oldPassword, newPassword) {
        return {
            path: '/accounts/password',
            method: 'PUT',
            body: JSON.stringify({ oldPassword, newPassword }),
            responseType: 'text',
        };
    },
    updateEmail(email) {
        return {
            path: '/accounts/email',
            method: 'PUT',
            body: JSON.stringify({ email }),
            responseType: 'text',
        };
    },
    deleteEmail() {
        return {
            path: '/accounts/email',
            method: 'DELETE',
            responseType: 'text',
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
            responseType: 'text',
        };
    },
    getDeleteAccountAuth(password) {
        return {
            path: '/tasks/account/get-delete-token',
            method: 'POST',
            body: JSON.stringify({ password }),
        };
    },
    deleteAccount() {
        return {
            path: '/accounts',
            method: 'DELETE',
            responseType: 'text',
        };
    },
    updateMarketingEnabled(value) {
        return {
            path: '/accounts/marketingEnabled',
            method: 'PUT',
            body: JSON.stringify({ value }),
            responseType: 'text',
        };
    },
    refreshSession() {
        return {
            path: '/accounts/auth/refresh',
            method: 'GET',
        };
    },
    guardianLogin(email) {
        return {
            path: '/guardian/login',
            method: 'POST',
            body: JSON.stringify({ email }),
        };
    },
    guardianUsers() {
        return {
            path: '/guardian/users',
            method: 'GET',
            responseType: 'text',
        };
    },
    guardianSubscriptions() {
        return {
            path: '/guardian/subscriptions',
            method: 'GET',
            responseType: 'json',
        };
    },
    guardianAttachSubscription(subscriptionId, userid) {
        return {
            path: '/guardian/attachSubscription',
            method: 'PUT',
            body: JSON.stringify({ subscriptionId, userid }),
            responseType: 'text',
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

    updateUsername(username, token) {
        const endpoint = this.getEndpoint('updateUsername', username);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    updatePassword(oldPassword, newPassword) {
        const endpoint = this.getEndpoint('updatePassword', oldPassword, newPassword);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    updateEmail(email, token) {
        const endpoint = this.getEndpoint('updateEmail', email);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    refreshSession() {
        const endpoint = this.getEndpoint('refreshSession');
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * NOT for use in kit app ui
     * Delete email is currently only used on the guardian website
     * @param token Email token passed by consent email
     */
    deleteEmail(token) {
        const endpoint = this.getEndpoint('deleteEmail');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * NOT for use in kit app ui
     * Get consent is currently only used on the guardian website
     * @param token Email token passed by consent email
     */
    getConsent(token) {
        const endpoint = this.getEndpoint('getConsent');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
     * NOT for use in kit app ui
     * Update consent is currently only used on the guardian website
     * @param consent Boolean to set consent
     * @param token Email token passed by consent email
     */
    updateConsent(consent, token) {
        const endpoint = this.getEndpoint('updateConsent', consent);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
    * Request permission token to delete user account
    * @returns token to be used for account deletion
    */
    getDeleteAccountAuth(password) {
        const endpoint = this.getEndpoint('getDeleteAccountAuth', password);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
    * Permanently delete user account
    * @param deleteAccountAuthToken One use token provided by the getDeleteAccountAuth method above
    */
    deleteAccount(deleteAccountAuthToken) {
        const endpoint = this.getEndpoint('deleteAccount');
        if (deleteAccountAuthToken) {
            endpoint.headers.append('Authorization', `Bearer ${deleteAccountAuthToken}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    /**
    * Update the marketing preference associated with an account
    * @param token The token to use to identify the user
    */
    updateMarketingEnabled(value, token) {
        const endpoint = this.getEndpoint('updateMarketingEnabled', value);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    guardianLogin(guardianEmail) {
        const endpoint = this.getEndpoint('guardianLogin', guardianEmail);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    guardianUsers(token) {
        const endpoint = this.getEndpoint('guardianUsers');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    guardianSubscriptions(token) {
        const endpoint = this.getEndpoint('guardianSubscriptions');
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    guardianAttachSubscription(subscriptionId, userid, token) {
        const endpoint = this.getEndpoint('guardianAttachSubscription', subscriptionId, userid);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default AccountClient;
