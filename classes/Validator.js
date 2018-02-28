class Validator {
    constructor(...args) {
        let Ajv;
        let draft = '../schemas/json-schema-draft-06.json';
        let commons = {
            'common/badge': '../schemas/common/badge.json',
            'common/challenge-set': '../schemas/common/challenge-set.json',
            'common/character-generator': '../schemas/common/character-generator.json',
            'common/roles': '../schemas/common/roles.json'
        };
        let schemas = {
            'create-user': '../schemas/methods/create-user.json',
            'get-user': '../schemas/methods/get-user.json',
            'remove-user': '../schemas/methods/remove-user.json',
            'update-user': '../schemas/methods/update-user.json'
        };
        if (typeof args[0] === 'object') {
            const options = args[0];
            if (!options.Ajv) {
                throw new Error('Ajv class is required.');
            }
            Ajv = options.Ajv;
            draft = options.draft || draft;
            commons = options.commons || commons;
            schemas = options.schemas || schemas;
        }
        this.ajv = new Ajv();

        // Draft
        const loadDraft = this.loadDraft(draft);

        // Register "common" schemas
        const loadCommon = Promise.all(Object.keys(commons).map((commonKey) => {
            return this.loadCommon(commonKey, commons[commonKey]);
        }));

        // Load schemas
        const loadSchemas = Promise.all(Object.keys(schemas).map((schemaId) => {
            return this.loadSchema(schemaId, schemas[schemaId]);
        }));

        Promise.all([loadDraft, loadCommon])
            .then(loadSchemas)
            .catch((error) => {
                console.log('error', error);
                return false;
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
            this.schemas = [];
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
        const schema = this.schemas[schemaName];
        if (!schema) {
            return Promise.reject(new Error('Schema does not exist.'));
        }
        return Promise.resolve(this.ajv.validate(schema, data));
    }
}

export default Validator;
