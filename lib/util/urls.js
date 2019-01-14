import { Client } from '../client.js';

export function userAvatar(id, base) {
    return `${Client.formatUrl(base)}/${id}/head.png`;
}

export function userAvatarFull(id, base) {
    return `${Client.formatUrl(base)}/${id}/full.png`;
}

export default { userAvatar };
