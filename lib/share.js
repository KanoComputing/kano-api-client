import { Client } from './client.js';

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
    feedByHardware(hardware, limit = 1000) {
        return `/shares?hardware=${hardware}&limit=${limit}`;
    },
    feedByFollow(uid, limit = 1000) {
        return `/shares?followedby=${uid}&limit=${limit}`;
    },
    features(limit = 1000) {
        return `/shares?features=true&limit=${limit}`;
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
    getComments(id) {
        return `/shares/${id}/comments`;
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
    share.userAvatar = `${Client.formatUrl(avatarBaseUrl)}/la/judoka-laugh.svg`;
    return share;
}

export class ShareClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }
    feed(limit) {
        const name = 'feed';
        return this.fetch(this.getEndpoint(name, limit))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    userFeed(id, limit) {
        const name = 'userFeed';
        return this.fetch(this.getEndpoint(name, id, limit))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    feedByApp(app, limit) {
        const name = 'feedByApp';
        return this.fetch(this.getEndpoint(name, app, limit))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    feedByHardware(hardware, limit) {
        const name = 'feedByHardware';
        return this.fetch(this.getEndpoint(name, hardware, limit))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    feedByFollow(uid, limit) {
        const name = 'feedByFollow';
        return this.fetch(this.getEndpoint(name, uid, limit))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    features(limit) {
        const name = 'features';
        return this.fetch(this.getEndpoint(name, limit))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
    getListByIds(ids) {
        const name = 'getShareListByIds';
        return this.fetch(this.getEndpoint(name, ids))
            .then(res => res.data.shares.map(share => expandShare(share, res.data.atBurl, res.data.aBurl)))
            .then(data => this.afterSuccess(name, data));
    }
    getById(id) {
        const name = 'getById';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => expandShare(res.data.share, res.data.atBurl, res.data.aBurl))
            .then(data => this.afterSuccess(name, data));
    }
    getBySlug(slug) {
        const name = 'getBySlug';
        return this.fetch(this.getEndpoint(name, slug))
            .then(res => expandShare(res.data.share, res.data.atBurl, res.data.aBurl))
            .then(data => this.afterSuccess(name, data));
    }
    recordView(id, uid) {
        const name = 'recordView';
        return this.fetch(this.getEndpoint(name, id, uid))
            .then(data => this.afterSuccess(name, data));
    }
    recordLike(id) {
        const name = 'recordLike';
        return this.fetch(this.getEndpoint(name, id))
            .then(data => this.afterSuccess(name, data));
    }
    getComments(id) {
        const name = 'getComments';
        return this.fetch(this.getEndpoint(name, id))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data || []));
    }
}

export default ShareClient;
