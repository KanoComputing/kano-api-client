import { Client } from './client.js';
import * as urls from './util/urls.js';

const renameMap = {
    full: 'body',
};

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
    getAvatar() {
        return '/users/avatar';
    },
    putAvatar(uid, data) {
        return {
            path: '/users/avatar',
            method: 'PUT',
            body: JSON.stringify(
                data
            ),
        };
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
    updateBio(bio) {
        return {
            path: '/users/bio',
            method: 'PUT',
            body: JSON.stringify({
                bio,
            }),
        };
    },
    getFlags() {
        return  '/users/flags';
    },
};

function normalizeFollows(follows) {
    const following = follows.following.map(user => {
        user.avatar = urls.userAvatar(user.id, follows.aBurl);
        return user;
    });
    const followers = follows.followers.map(user => {
        user.avatar = urls.userAvatar(user.id, follows.aBurl);
        return user;
    });
    return { following, followers };
}
function expandUser(user, avatarBaseUrl) {
    user.avatar = urls.userAvatar(user.id, avatarBaseUrl);
    return user;
}

export class UserClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }
    getById(id) {
        const endpoint = this.getEndpoint('userById', id);
        return this.fetch(endpoint)
            .then(res => expandUser(res.data.user, res.data.aBurl))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    getByUsername(username) {
        const endpoint = this.getEndpoint('userByUsername', username);
        return this.fetch(endpoint)
            .then(res => expandUser(res.data.user, res.data.aBurl))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    getListByIds(ids) {
        const endpoint = this.getEndpoint('getListByIds', ids);
        return this.fetch(endpoint)
            .then(res => res.data.users.map(user => expandUser(user, res.data.aBurl)))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    getFollows(id) {
        const endpoint = this.getEndpoint('getFollows', id);
        return this.fetch(endpoint)
            .then(res => normalizeFollows(res.data))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    follow(id) {
        const endpoint = this.getEndpoint('follow', id);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    unfollow(id) {
        const endpoint = this.getEndpoint('unfollow', id);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    updateBio(id) {
        const endpoint = this.getEndpoint('updateBio', id);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    getAvatar() {
        const endpoint = this.getEndpoint('getAvatar');
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    putAvatar(uid, avatarData) {
        const { images, colorEls, slots, hiddenBones } = avatarData;
        const dbData = {
            colorEls,
            slots,
            hiddenBones,
        };
        const endpoint = this.getEndpoint('putAvatar', uid, dbData);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => {
                this.afterDataProcessed(endpoint, data);
                return data.aurls;
            })
            .then(urls => {
                const upload = (image, url) => {
                    return fetch(url, {
                        method: 'put',
                        body: image,
                        headers: {
                            'Content-Type': 'image/png',
                            'Content-Length': image.size.toString(),
                        }
                    });
                };
                const promises = urls.map((url) => {
                    const actualKey = renameMap[url.key] || url.key;
                    return upload(images[actualKey], url.url);
                });
                return Promise.all(promises);
            });
    }
    getFlags() {
        const endpoint = this.getEndpoint('getFlags');
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default UserClient;
