export class ResponseCache {
    static get prefix() {
        return 'cached';
    }
    static getKey(endpoint) {
        /* TODO hash the keys */
        let key = `${ResponseCache.prefix}:${endpoint.method}:${endpoint.name}:`;
        if (endpoint.cacheId) {
            key += endpoint.cacheId;
        } else {
            key += endpoint.url;
        }
        return key;
    }
    static lookup(endpoint) {
        const response = localStorage.getItem(ResponseCache.getKey(endpoint));
        if (response) {
            return JSON.parse(response);
        }

        return null;
    }

    static store(endpoint, rawData) {
        localStorage.setItem(ResponseCache.getKey(endpoint), JSON.stringify(rawData));
    }

    static remove(endpoint) {
        localStorage.removeItem(ResponseCache.getKey(endpoint));
    }


}

export default ResponseCache;