import { Client } from './client.js';

const ENDPOINTS = {
    userById(id) {
        return `/users/${id}`;
    },
    userByUsername(username) {
        return `/users/?username=${username}`;
    },
    getListByIds(ids) {
        return `/users?ids=${ids.join(',')}`;
    },
    getFollows(id) {
        return `/users/${id}/follows`;
    },
    follow(id) {
        return {
            path: `/users/following/${id}`,
            method: 'POST',
        };
    },
    unfollow(id) {
        return {
            path: `/users/following/${id}`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
};

export class UserClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }
    getById(id) {
        const name = 'userById';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => res.data.user)
            .then(data => this.afterSuccess(name, data));
    }
    getByUsername(username) {
        const name = 'userByUsername';
        return this.fetch(this.getEndpoint(name, username))
            .then(res => res.data.user)
            .then(data => this.afterSuccess(name, data));
    }
    getListByIds(ids) {
        const name = 'getListByIds';
        return this.fetch(this.getEndpoint(name, ids))
            .then(res => res.data.users)
            .then(data => this.afterSuccess(name, data));
    }
    getFollows(id) {
        const name = 'getFollows';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    follow(id) {
        const name = 'follow';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    unfollow(id) {
        const name = 'unfollow';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
}

export default UserClient;
