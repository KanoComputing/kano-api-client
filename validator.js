class Validator {
    constructor() {
        this.schemas = [];
    }
    fetchSchema(uri) {
        if (typeof uri !== 'string') {
            return Promise.reject(new Error('Invalid argument'));
        }
        return fetch(uri)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('File not found');
                }
                return res.json();
            });
    }
    setSchema(key, schema) {
        if (typeof key !== 'string') {
            return Promise.reject(new Error('Invalid argument'));
        }
        if (typeof schema !== 'object') {
            return Promise.reject(new Error('Invalid argument'));
        }
        if (!this.schemas) {
            return Promise.reject(new Error('Validator is corrupted'));
        }
        this.schemas[key] = schema;
        return Promise.resolve();
    }
    loadSchemas(key, uri) {
        return this.fetchSchema(uri)
            .then((res) => {
                return this.setSchema(key, res)
                    .then(() => {
                        return Promise.resolve(res);
                    });
            });
    }
}

export default Validator
