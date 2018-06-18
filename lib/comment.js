import { Client } from './client.js';

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
    }
};

function expandComment(comment) {
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
            .then(res => res.data.comments.map(comment => expandComment(comment)))   
            .then(data => this.afterSuccess(name, data));
    }
    post(id, content) {
        const name = 'post';
        return this.fetch(this.getEndpoint(name, id, content))
            .then(res => res.data)
            .then(data => this.afterSuccess(name, data));
    }
}

export default CommentClient;
