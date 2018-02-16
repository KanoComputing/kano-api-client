// TODO: Find a way to import `Ajv` here

class Validator {
    constructor() {
        // TODO: "Fetch" schemas. It's important to solve how to know the path
        // for the schemas, knowing they will be in a different path when testing
        // and in different plattforms (Cordova, web, electron)
        this.schemas = [];
        // TODO: Attach an instance of `Ajv`
        // TODO: Setup `Ajv` draft
        // TODO: Register "common" schemas
        // TODO: Load fetched schemas
    }
    static fetchSchema(uri) {
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
        return Validator.fetchSchema(uri)
            .then((res) => {
                return this.setSchema(key, res)
                    .then(() => {
                        return Promise.resolve(res);
                    });
            });
    }
    // TODO: Implement `validate` like in the `kano-hardware-communication-layer`
    // but returing a promise instead of boolean
}

export default Validator;
