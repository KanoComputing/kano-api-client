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
    }
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
        const name = 'userById';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => expandUser(res.data.user, res.data.aBurl))
            .then(data => this.afterSuccess(name, data));
    }
    getByUsername(username) {
        const name = 'userByUsername';
        return this.fetch(this.getEndpoint(name, username))
            .then(res => expandUser(res.data.user, res.data.aBurl))
            .then(data => this.afterSuccess(name, data));
    }
    getListByIds(ids) {
        const name = 'getListByIds';
        return this.fetch(this.getEndpoint(name, ids))
            .then(res => res.data.users.map(user => expandUser(user, res.data.aBurl)))
            .then(data => this.afterSuccess(name, data));
    }
    getFollows(id) {
        const name = 'getFollows';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => normalizeFollows(res.data))
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
    updateBio(id) {
        const name = 'updateBio';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    getAvatar() {
        const name = 'getAvatar';
        return this.fetch(this.getEndpoint(name))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    putAvatar(uid, avatarData) {
        const name = 'putAvatar';
        const { images, colorEls, slots, hiddenBones } = avatarData;
        const dbData = {
            colorEls,
            slots,
            hiddenBones,
        };
        return this.fetch(this.getEndpoint(name, uid, dbData))
            .then(res => res.data)
            .then(data => {
                this.afterSuccess(name, data);
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
}

export default UserClient;
