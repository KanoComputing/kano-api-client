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
    postCommentFlag(cid) {
        return {
            path: `/comments/${cid}/flag`,
            method: 'POST',
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
        const name = 'getListByIds';
        return this.fetch(this.getEndpoint(name, ids))
            .then(res => res.data.comments.map(comment => expandComment(comment, res.data.avatarBaseUrl || res.data.aBurl)))   
            .then(data => this.afterSuccess(name, data));
    }
    post(id, content) {
        const name = 'post';
        return this.fetch(this.getEndpoint(name, id, content))
            .then(res => expandComment(res.data.comment, res.data.avatarBaseUrl || res.data.aBurl))
            .then(data => this.afterSuccess(name, data));
    }
    postCommentFlag(id) {
        const name = 'postCommentFlag';
        return this.fetch(this.getEndpoint(name, id))
            .then(data => this.afterSuccess(name, data));
    }
}

export default CommentClient;
