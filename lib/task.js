import { Client } from './client.js';

const TASK_ENDPOINTS = {
    sendEmail(type) {
        return {
            path: '/tasks/send-email',
            method: 'POST',
            body: JSON.stringify({ type }),
        }
    },
};

export class TaskClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(TASK_ENDPOINTS);
    }

    sendEmail(type) {
        const endpoint = this.getEndpoint('sendEmail', type);
        return this.fetch(endpoint)
            .then(res => res.data)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default TaskClient;
