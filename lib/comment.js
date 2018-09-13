import { Client } from './client.js';
import * as urls from './util/urls.js';

const ENDPOINTS = {
    getListByIds(ids) {
        const path = `/comments?ids=${ids.join(',')}`;
        if (!ids.length) {
            return {
                path,
                response: { data: { comments: [] } },
            };
        }
        return path;
    },
    post(id, content) {
        return {
            path: '/comments',
            method: 'POST',
            body: JSON.stringify({ sid: id, comment: content }),
        };
    },
    deleteComment(cid) {
        return {
            path: `/comments/${cid}`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
    flagComment(cid) {
        return {
            path: `/comments/${cid}/flags`,
            method: 'POST',
            responseType: 'text',
        };
    },
    unflagComment(cid) {
        return {
            path: `/comments/${cid}/flags`,
            method: 'DELETE',
            responseType: 'text',
        };
    },
};

function fromAPIDate(date) {
    return new Date(`${date}+0000`);
}

function expandComment(comment, avatarBaseUrl) {
    if (comment.created) {
        comment.created = fromAPIDate(comment.created);
    }
    if (comment.modified) {
        comment.modified = fromAPIDate(comment.modified);
    }
    comment.avatar = urls.userAvatar(comment.userid, avatarBaseUrl);
    return comment;
}

export class CommentClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }
    getListByIds(ids) {
        const endpoint = this.getEndpoint('getListByIds', ids);
        return this.fetch(endpoint)
            .then(res => res.data.comments.map(comment => expandComment(comment, res.data.avatarBaseUrl || res.data.aBurl)))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    post(id, content) {
        const endpoint = this.getEndpoint('post', id, content);
        return this.fetch(endpoint)
            .then(res => expandComment(res.data.comment, res.data.avatarBaseUrl || res.data.aBurl))
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    deleteComment(id) {
        const endpoint = this.getEndpoint('deleteComment', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    flagComment(id) {
        const endpoint = this.getEndpoint('flagComment', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
    unflagComment(id) {
        const endpoint = this.getEndpoint('unflagComment', id);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default CommentClient;
