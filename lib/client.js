const DEFAULT_OPTIONS = {
    defaultHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
};

export class Client {
    constructor(opts = {}) {
        if (opts instanceof Client) {
            this.options = Object.assign({}, opts.options);
            this.plugins = opts.plugins.slice(0);
            this.endpoints = Object.assign({}, opts.endpoints);
        } else {
            this.options = Object.assign({}, DEFAULT_OPTIONS, opts);
            if (!this.options.url) {
                throw new Error('Missing `url` option');
            }
            this.options.url = Client.formatUrl(this.options.url);
            this.endpoints = {};
            this.plugins = [];
        }
    }
    static formatUrl(url) {
        if (url[url.length - 1] === '/') {
            return url.substring(0, url.length - 1);
        }
        return url;
    }
    addEndpoints(endpoints) {
        Object.assign(this.endpoints, endpoints);
    }
    getEndpointUrl(path) {
        return `${this.options.url}${path}`;
    }
    getEndpointHeaders(headers = {}) {
        const headersObj = Object.assign({}, this.options.defaultHeaders, headers);
        return new Headers(headersObj);
    }
    getEndpointMethod(method = 'GET') {
        return method;
    }
    getEndpointResponseType(type = 'json') {
        return type;
    }
    getEndpointMode(mode = 'cors') {
        return mode;
    }
    getEndpoint(name, ...args) {
        const endpointFunc = this.endpoints[name];
        if (!endpointFunc) {
            throw new Error(`Endpoint '${name}' does not exists`);
        }
        const endpoint = endpointFunc(...args);
        const endpointType = typeof endpoint;
        if (endpointType === 'function' || endpointType === 'string') {
            return {
                name,
                url: this.getEndpointUrl(endpoint, ...args),
                method: this.getEndpointMethod(),
                headers: this.getEndpointHeaders(),
                responseType: this.getEndpointResponseType(),
                mode: this.getEndpointMode(),
            };
        }
        const url = this.getEndpointUrl(endpoint.path, ...args);
        const headers = this.getEndpointHeaders(endpoint.headers, ...args);
        const method = this.getEndpointMethod(endpoint.method, ...args);
        return {
            name,
            url,
            headers,
            method,
            body: endpoint.body,
            response: endpoint.response,
            responseType: this.getEndpointResponseType(endpoint.responseType),
            params: endpoint.params,
            mode: this.getEndpointMode(endpoint.mode),
        };
    }
    fetch(endpoint) {
        let p = Promise.resolve(endpoint);
        let endpointObject;
        let cachedError;

        this.plugins.forEach((plugin) => {
            if (typeof plugin.beforeFetch === 'function') {
                p = p.then(e => plugin.beforeFetch(e));
            }
        });
        return p.then((e) => {
            endpointObject = e;

            if (e.response) {
                return e.response;
            }
            return fetch(e.url, {
                method: e.method,
                headers: e.headers,
                body: e.body,
                mode: e.mode,
            }).then((r) => {
                if (!r.ok) {
                    throw r;
                }
                return r;
            }).then(r => r[e.responseType]()).then(data => this.afterDataReceived(endpoint, data));
        }).catch((error) => {
            cachedError = error;
            return Promise.all(this.runPluginsCallbacks('onError', endpointObject, error)).then(() => {
                /**
                 * If a plugin gave a response, go with it instead of rethrowing.
                 * This is useful to handle offline responses.
                 */
                if (endpointObject.response) {
                    return endpointObject.response;
                }

                throw cachedError;
            });
        });
    }
    runPluginsCallbacksSeries(name, endpoint, data) {
        let p = Promise.resolve(data);
        this.plugins.forEach((plugin) => {
            if (typeof plugin[name] === 'function') {
                p = p.then(d => plugin[name](endpoint, d));
            }
        });
        return p;
    }
    afterDataReceived(endpoint, rawData) {
        return this.runPluginsCallbacksSeries('afterDataReceived', endpoint, rawData);
    }
    afterDataProcessed(endpoint, data) {
        return this.runPluginsCallbacksSeries('afterDataProcessed', endpoint, data);
    }

    addPlugin(plugin) {
        this.plugins.push(plugin);
        this.runPluginsCallbacks('onInstall', this);
    }
    runPluginsCallbacks(name, ...args) {
        return this.plugins.map((plugin) => {
            if (typeof plugin[name] === 'function') {
                return plugin[name](...args);
            }
            return null;
        });
    }
}

export default Client;