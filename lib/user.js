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
                bio
            }),
        };
    }
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
        const { images, skinTone, slots } = avatarData;
        const dbData = {
            skinTone,
            slots,
        };
        return this.fetch(this.getEndpoint(name, uid, dbData))
            .then(res => res.data)
            .then(data => {
                this.afterSuccess(name, data);
                return data.aurls;
            })
            .then(urls => {
                const upload = (image) => {
                    // function dataURItoBlob(dataURI) {
                    //     var binary = atob(dataURI.split(',')[1]);
                    //     var array = [];
                    //     for (var i = 0; i < binary.length; i++) {
                    //         array.push(binary.charCodeAt(i));
                    //     }
                    //     return new Blob([new Uint8Array(array)], {
                    //         type: 'image/png'
                    //     });
                    // }
                    // const blob = dataURItoBlob(image);
                    const file = new File([image], 'head.png');
                    console.log(image);
                    console.log(file);
                    fetch(urls[0].url, {
                        method: 'put',
                        body: file,
                        headers: {
                            'Content-Type': 'image/png',
                            'Content-Length': file.size.toString(),
                        }
                    })
                        .then(success => {
                            console.log(success);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                };
                upload(images[0].body);
            });
    }
}

export default UserClient;
