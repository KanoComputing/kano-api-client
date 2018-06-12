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

function expandShare(share, attachmentBaseUrl, avatarBaseUrl) {
    share.cover = `${attachmentBaseUrl}/covers/${share.legacyId}.png`;
    share.cover_url = share.cover;
    share.userAvatar = `${avatarBaseUrl}/la/judoka-laugh.svg`;
    switch (share.app) {
    case 'make-apps': {
        share.workspace_info_url = `${attachmentBaseUrl}/workspace-info/${share.legacyId}.json`;
        share.attachment_url = `${attachmentBaseUrl}/attachments/${share.legacyId}.html`;
        // TODO: Fix all this when API manages attachments per share
        // share.lightboard_spritesheet_url = `${attachmentBaseUrl}/lightboard-spritesheets/${share.legacyId}.png`;
        share.cover = `${attachmentBaseUrl}/covers/${share.legacyId}.gif`;
        share.cover_url = share.cover;
        break;
    }
    case 'kano-draw': {
        share.attachment_url = `${attachmentBaseUrl}/attachments/${share.legacyId}.draw`;
        break;
    }
    default: {
        break;
    }
    }
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
