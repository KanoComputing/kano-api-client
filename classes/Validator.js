class Validator {
    constructor(Ajv) {
        this.ajv = new Ajv();

        // Draft
        const loadDraft = this.loadDraft('../schemas/json-schema-draft-06.json');

        // Register "common" schemas
        const loadCommon = Promise.all([
            this.loadCommon('common/badge.json', '../schemas/common/badge.json'),
            this.loadCommon('common/challenge-set.json', '../schemas/common/challenge-set.json'),
            this.loadCommon('common/character-generator.json', '../schemas/common/character-generator.json'),
            this.loadCommon('common/roles.json', '../schemas/common/roles.json')
        ]);

        // Load schemas
        const loadSchemas = Promise.all([
            this.loadSchema('create-user', '../schemas/methods/create-user.json'),
            this.loadSchema('get-user', '../schemas/methods/get-user.json'),
            this.loadSchema('remove-user', '../schemas/methods/remove-user.json'),
            this.loadSchema('update-user', '../schemas/methods/update-user.json')
        ]);

        Promise.all([loadDraft, loadCommon, loadSchemas])
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
    // TODO: Implement `validate` like in the `kano-hardware-communication-layer`
    // but returing a promise instead of boolean
}

export default Validator;
