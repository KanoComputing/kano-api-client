import { Client } from './client.js';

const ENDPOINTS = {
    getProgress(userId) {
        return {
            path: `/gamification/${userId}`,
            params: { userId },
        };
    },
    getPartialProgress(userId, ruleIds) {
        return {
            path: `/gamification/${userId}` + (Array.isArray(ruleIds) ? `?rules=${ruleIds.join(',')}` : ''),
            params: { userId, ruleIds },
        };
    },
    getPartialProgressForMultipleUsers(userIds, ruleIds) {
        return `/gamification?users=${userIds.join(',')}&rules=${ruleIds.join(',')}`;
    },
    trigger(eventOrArray) {
        return {
            path: '/gamification',
            method: 'POST',
            body: JSON.stringify(eventOrArray),
            params: { eventOrArray },
        };
    },
};

export class GamificationClient extends Client {
    constructor(opts = {}) {
        super(opts);

        this.token = opts.token;
        this.addEndpoints(ENDPOINTS);
    }
    getProgress(userId) {
        const endpoint = this.getEndpoint('getProgress', userId);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterSuccess(endpoint, data));
    }
    getPartialProgress(userId, ruleIds) {
        const endpoint = this.getEndpoint('getPartialProgress', userId, ruleIds);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterSuccess(endpoint, data));
    }
    getPartialProgressForMultipleUsers(userIds, ruleIds) {
        const endpoint = this.getEndpoint('getPartialProgressForMultipleUsers', userIds, ruleIds);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    trigger(eventOrArray) {
        const endpoint = this.getEndpoint('trigger', eventOrArray);
        if (this.token) {
            endpoint.headers.append('Authorization', `Bearer ${this.token}`);
        }

        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterSuccess(endpoint, data));
    }
}

export default GamificationClient;
