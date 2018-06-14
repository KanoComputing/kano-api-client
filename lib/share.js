import { Client } from './client.js';

const ENDPOINTS = {
    feed(limit = 1000) {
        return `/shares?limit=${limit}`;
    },
    userFeed(uid, limit = 1000) {
        return `/shares?uid=${uid}&limit=${limit}`;
    },
    features(limit = 1000) {
        return `/shares?features=true&limit=${limit}`;
    },
    getListByIds(ids) {
        const path = `/shares?ids=${ids.join(',')}`;
        if (!ids.length) {
            return {
                path,
                response: { data: { shares: [] } },
            };
        }
        return path;
    }
};

function generateAttachmentPath(attachments, key, id) {
    return `/${id}/${key}.${attachments[key]}`;
}

function expandShare(share, attachmentBaseUrl, avatarBaseUrl) {
    Object.keys(share.attachments).forEach((key) => {
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
    features(limit) {
        const name = 'features';
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
    getListByIds(ids) {
        const name = 'getListByIds';
        return this.fetch(this.getEndpoint(name, ids))
            .then(res => res.data.shares.map(share => expandShare(share, res.data.atBurl, res.data.aBurl)))
            .then(data => this.afterSuccess(name, data));
    }
}

export default ShareClient;
