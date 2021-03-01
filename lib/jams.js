import { Client } from './client.js';

const ENDPOINTS = {
    getJamSessions(limit) {
        return `/jam-sessions${limit ? `?limit=${limit}` : ''}`;
    },
    joinLobby(jamSessionId) {
        return {
            path: `/jam-sessions/${jamSessionId}/join`,
            method: 'POST',
        };
    },
    getJamSessionLobby(lobbyId) {
        return `/jam-session-lobbies/${lobbyId}`;
    },
    createJamUploadLink(lobbyId) {
        return {
            path: `/jam-session-lobbies/${lobbyId}/creation-upload-link`,
            method: 'POST',
        };
    },
    leaveJamSessionLobby(lobbyId) {
        return {
            path: `/jam-session-lobbies/${lobbyId}/leave`,
            method: 'POST',
            responseType: 'text',
        };
    },
};

export class JamsClient extends Client {
    constructor(opts = {}) {
        super(opts);
        this.addEndpoints(ENDPOINTS);
    }

    getJamSessions(limit) {
        const endpoint = this.getEndpoint('getJamSessions', limit);
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    joinLobby(jamSessionId, token) {
        const endpoint = this.getEndpoint('joinLobby', jamSessionId);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    getJamSessionLobby(lobbyId, token) {
        const endpoint = this.getEndpoint('getJamSessionLobby', lobbyId);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    createJamUploadLink(lobbyId, token) {
        const endpoint = this.getEndpoint('createJamUploadLink', lobbyId);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }

    leaveJamSessionLobby(lobbyId, token) {
        const endpoint = this.getEndpoint('leaveJamSessionLobby', lobbyId);
        if (token) {
            endpoint.headers.append('Authorization', `Bearer ${token}`);
        }
        return this.fetch(endpoint)
            .then(data => this.afterDataProcessed(endpoint, data));
    }
}

export default JamsClient;
