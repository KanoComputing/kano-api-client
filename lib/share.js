import { Client } from './client.js';
import * as urls from './util/urls.js';

const ENDPOINTS = {
    feed(limit = 1000) {
        return `/shares?limit=${limit}`;
    },
    userFeed(uid, limit = 1000) {
        return `/shares?uid=${uid}&limit=${limit}`;
    },
    feedByApp(app, limit = 1000) {
        return `/shares?app=${app}&limit=${limit}`;
    },
    // TODO: feedByHardware and feedByHardwareFeatured should be the same function as so:
    // feedByHardware(hardware, featured = true, limit = 1000) {
    //     return `/shares?hardware=${hardware}&featured=${featured}&limit=${limit}`;
    // },
    feedByHardware(hardware, limit = 1000) {
        return `/shares?hardware=${hardware}&limit=${limit}`;
    },
    feedByHardwareFeatured(hardware, featured = true, limit = 1000) {
        return `/shares?hardware=${hardware}&featured=${featured}&limit=${limit}`;
    },
    feedByFollow(uid, limit = 1000) {
        return `/shares?followedby=${uid}&limit=${limit}`;
    },
    featured(limit = 1000) {
        return `/shares?featured=true&limit=${limit}`;
    },
    getShareListByIds(ids) {
        const path = `/shares?ids=${ids.join(',')}`;
        if (!ids.length) {
            return {
                path,
                response: { data: { shares: [] } },
            };
        }
        return path;
    },
    getBySlug(slug) {
        return `/shares?slug=${slug}`;
    },
    getById(id) {
        return `/shares/${id}`;
    },
    getByParentId(id) {
        return `/shares/${id}/parent`;
    },
    recordView(id, uid) {
        return {
            path: `/shares/${id}/views`,
            method: 'POST',
            body: uid ? JSON.stringify({ uid }) : null,
            responseType: 'text',
        };
    },
    recordLike(id) {
        return {
            path: `/shares/${id}/likes`,
            method: 'POST',
            responseType: 'text',
            body: JSON.stringify({}),
        };
    },
    deleteLike(id) {
        return {
            path: `/shares/${id}/likes`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
    getComments(id) {
        return `/shares/${id}/comments`;
    },
    create(data) {
        const body = {
            app: data.app,
            title: data.title,
            description: data.description,
            isPrivate: data.isPrivate,
            hardware: data.hardware,
            attachments: data.attachments,
            parent: data.parent,
        };
        return {
            path: '/shares',
            method: 'POST',
            responseType: 'json',
            body: JSON.stringify(body),
        };
    },
    deleteShare(id) {
        return {
            path: `/shares/${id}`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
    deleteShareByAdmin(id) {
        return {
            path: `/admin/shares/${id}`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
    featureShareByAdmin(id, featured) {
        return {
            path: `/shares/${id}/featured`,
            method: 'PATCH',
            body: JSON.stringify({ featured }),
            responseType: 'text',
        };
    },
    flagShare(sid) {
        return {
            path: `/shares/${sid}/flags`,
            method: 'POST',
            responseType: 'text',
        };
    },
    unflagShare(sid) {
        return {
            path: `/shares/${sid}/flags`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
    moderate(sid) {
        return {
            path: `/shares/${sid}/moderate`,
            method: 'POST',
        };
    },
};

function generateAttachmentPath(attachments, key, id) {
    return `/${id}/${key}.${attachments[key]}`;
}

function expandShare(share, attachmentBaseUrl, avatarBaseUrl) {
    Object.keys(share.attachments || {}).forEach((key) => {
        const url = `${Client.formatUrl(attachmentBaseUrl)}${generateAttachmentPath(share.attachments, key, share.id)}`;
        share[key] = url;
        share[`${key}_url`] = url;
        share.attachments[key] = url;
    });
    share.userAvatar = urls.userAvatar(share.userid, avatarBaseUrl);
    return share;
}

export class ShareClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    feed(limit) {
        const endpoint = this.getEndpoint('feed', limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    userFeed(id, limit) {
        const endpoint = this.getEndpoint('userFeed', id, limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    feedByApp(app, limit) {
        const endpoint = this.getEndpoint('feedByApp', app, limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    feedByHardware(hardware, limit) {
        const endpoint = this.getEndpoint('feedByHardware', hardware, limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    feedByHardwareFeatured(hardware, featured, limit) {
        const endpoint = this.getEndpoint('feedByHardwareFeatured', hardware, featured, limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    feedByFollow(uid, limit) {
        const endpoint = this.getEndpoint('feedByFollow', uid, limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    featured(limit) {
        const endpoint = this.getEndpoint('featured', limit);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getListByIds(ids) {
        const endpoint = this.getEndpoint('getShareListByIds', ids);
        return this.fetch(endpoint)
            .then(res => res.data.shares.map(share => expandShare(
                share,
                res.data.atBurl,
                res.data.aBurl,
            )))
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getById(id) {
        const endpoint = this.getEndpoint('getById', id);
        return this.fetch(endpoint)
            .then(res => expandShare(res.data.share, res.data.atBurl, res.data.aBurl))
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getByParentId(id) {
        const endpoint = this.getEndpoint('getByParentId', id);
        return this.fetch(endpoint)
            .then(res => expandShare(res.data.share, res.data.atBurl, res.data.aBurl))
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getBySlug(slug) {
        const endpoint = this.getEndpoint('getBySlug', slug);
        return this.fetch(endpoint)
            .then(res => expandShare(res.data.share, res.data.atBurl, res.data.aBurl))
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    recordView(id, uid) {
        const endpoint = this.getEndpoint('recordView', id, uid);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    recordLike(id) {
        const endpoint = this.getEndpoint('recordLike', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    deleteLike(id) {
        const endpoint = this.getEndpoint('deleteLike', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getComments(id) {
        const endpoint = this.getEndpoint('getComments', id);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data || []));
    }

    create(data) {
        const endpoint = this.getEndpoint('create', data);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then((share) => {
                // Upload the attachments using the signed URLs
                const uploads = Object.keys(share.aturls)
                    .map((key) => {
                        const signedUrl = share.aturls[key];
                        return fetch(signedUrl, {
                            method: 'PUT',
                            body: data.files[key],
                            headers: new Headers({
                                'Content-Type': data.files[key].type,
                            }),
                        });
                    });
                return Promise.all(uploads).then(() => share);
            })
            .then((d) => {
                // All attachments are uploaded, trigger the moderation
                const moderate = this.getEndpoint('moderate', d.share.id);
                return this.fetch(moderate)
                    // Add the moderation data to the response object
                    .then(moderationData => Object.assign(d, { moderation: moderationData.data }));
            })
            .then(d => this.afterDataProcessed(endpoint, d || []));
    }

    deleteShare(id) {
        const endpoint = this.getEndpoint('deleteShare', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    deleteShareByAdmin(id) {
        const endpoint = this.getEndpoint('deleteShareByAdmin', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    featureShareByAdmin(id, featured) {
        const endpoint = this.getEndpoint('featureShareByAdmin', id, featured);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    flagShare(id) {
        const endpoint = this.getEndpoint('flagShare', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    unflagShare(id) {
        const endpoint = this.getEndpoint('unflagShare', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default ShareClient;
