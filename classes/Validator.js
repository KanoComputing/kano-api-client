class Validator {
    constructor(...args) {
        let Ajv;
        // Default state
        this.draftPath = '../schemas/json-schema-draft-06.json';
        this.commonsPath = {
            'common/badge': '../schemas/common/badge.json',
            'common/challenge-set': '../schemas/common/challenge-set.json',
            'common/character-generator': '../schemas/common/character-generator.json',
            'common/roles': '../schemas/common/roles.json'
        };
        this.schemasPath = {
            'create-user': '../schemas/methods/create-user.json',
            'get-user': '../schemas/methods/get-user.json',
            'remove-user': '../schemas/methods/remove-user.json',
            'update-user': '../schemas/methods/update-user.json'
        };
        // Override default states with argument
        if (typeof args[0] === 'object') {
            const options = args[0];
            Ajv = options.Ajv;
            this.draftPath = options.draft || this.draftPath;
            this.commonsPath = options.commons || this.commonsPath;
            this.schemasPath = options.schemas || this.schemasPath;
        }
        if (!Ajv) {
            throw new Error('Ajv class is required.');
        }
        this.ajv = new Ajv();
    }
    init() {
        // Load Draft
        return this.loadDraft(this.draftPath)
            .then(() => {
                // Register "common" schemas
                return Promise.all(Object.keys(this.commonsPath).map((commonKey) => {
                    return this.loadCommon(commonKey, this.commonsPath[commonKey]);
                }));
            })
            .then(() => {
                // Load validation schema schemas
                return Promise.all(Object.keys(this.schemasPath).map((schemaId) => {
                    return this.loadSchema(schemaId, this.schemasPath[schemaId]);
                }));
            });
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
            this.schemas = {};
        }
        this.schemas[key] = schema;
        return Promise.resolve();
    }
    loadSchema(key, uri) {
        return Validator.fetchSchema(uri)
            .then((res) => {
                return this.setSchema(key, res)
                    .then(() => {
                        return Promise.resolve(res);
                    });
            });
    }
    loadCommon(id, url) {
        return Validator.fetchSchema(url)
            .then((schema) => {
                this.ajv.addSchema(schema, id);
                return Promise.resolve(schema);
            });
    }
    loadDraft(url) {
        return Validator.fetchSchema(url)
            .then((draft) => {
                this.ajv.addMetaSchema(draft);
                return Promise.resolve(draft);
            });
    }
    validate(schemaName, data) {
        if (!this.schemas) {
            this.schemas = {};
        }
        const schema = this.schemas[schemaName];
        if (!schema) {
            return Promise.reject(new Error('Schema does not exist'));
        }
        const validated = this.ajv.validate(schema, data);
        if (!validated) {
            const error = new Error('Failed to validate');
            error.validation = this.ajv.errors;
            return Promise.reject(error);
        }
        return Promise.resolve(validated);
    }
}

export default Validator;
