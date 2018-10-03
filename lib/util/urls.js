import { Client } from '../client.js';

export function userAvatar(id, base) {
    return `${Client.formatUrl(base)}/${id}/head.png`;
}

export default { userAvatar };
