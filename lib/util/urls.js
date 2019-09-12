import { Client } from '../client.js';

export function userAvatar(id, base, ctx = null) {
    return `${Client.formatUrl(base)}/${id}${ctx ? `/${ctx}` : ''}/head.png`;
}

export function userAvatarFull(id, base, ctx = null) {
    return `${Client.formatUrl(base)}/${id}${ctx ? `/${ctx}` : ''}/full.png`;
}

export default { userAvatar };
