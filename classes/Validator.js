import Ajv from './Ajv.js';

class Validator {
    constructor(...args) {
        if (!Ajv) {
            throw new Error('Ajv class is required.');
        }
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
            this.draftPath = options.draft || this.draftPath;
            this.commonsPath = options.commons || this.commonsPath;
            this.schemasPath = options.schemas || this.schemasPath;
        }
        this.ajv = new Ajv();
    }
    /**
     * Initializes validator by loading draft, reference and schemas. If the
     * schemas are already loaded it's possible to use the separated methods
     * to set them.
     *
     * @return {Promise}
     */
    init() {
        // Load Draft
        return this.loadDraft(this.draftPath)
            .then(() => {
                // Register "common" schemas
                return Promise.all(Object.keys(this.commonsPath).map((commonKey) => {
                    return this.loadReference(commonKey, this.commonsPath[commonKey]);
                }));
            })
            .then(() => {
                // Load validation schema schemas
                return Promise.all(Object.keys(this.schemasPath).map((schemaId) => {
                    return this.loadSchema(schemaId, this.schemasPath[schemaId]);
                }));
            });
    }
    /**
     * Fetches a schema given its uri.
     *
     * @param {String} uri Schema's location
     * @return {Promise}
     */
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
    /**
     * Given an id and a schema, set a schema to the `Validator` class for
     * further use with the `validate` method.
     *
     * @param {String} id Unique id for that schemas
     * @param {Object} schema JSON schema to be associated with the unique id
     * @return {Promise}
     */
    setSchema(id, schema) {
        if (typeof id !== 'string') {
            return Promise.reject(new Error('Invalid argument'));
        }
        if (typeof schema !== 'object') {
            return Promise.reject(new Error('Invalid argument'));
        }
        if (!this.schemas) {
            this.schemas = {};
        }
        this.schemas[id] = schema;
        return Promise.resolve();
    }
    /**
     * Given an id and a location for the schema, fetch and set the schema to
     * the `Validator`.
     *
     * @param {String} id Unique id for that schemas
     * @param {String} uri Schema's location
     * @return {Promise}
     */
    loadSchema(id, uri) {
        return Validator.fetchSchema(uri)
            .then((response) => {
                return this.setSchema(id, response)
                    .then(() => {
                        return Promise.resolve(response);
                    });
            });
    }
    /**
     * Given an id and a schema, set a reference schema to the `Validator` class
     * for further use with in schemas. This id will be available to be used as
     * `$ref` on JSON schemas.
     * For example by calling `setReference('common/test.json', testJson)` it's
     * possible to use `testJson` as an external reference in other schemas:
     * `{ "someProperty": { "$ref": "common/test.json"}}`.
     *
     * @param {String} id Unique id for that schemas
     * @param {Object} schema JSON schema to be associated with the unique id
     * @return {Promise}
     */
    setReference(id, schema) {
        this.ajv.addSchema(schema, id);
        return Promise.resolve(schema);
    }
    /**
     * Given an id and a location for the schema, fetch and set the schema as
     * reference on the `Validator`.
     *
     * @param {String} id Unique id for that schemas
     * @param {String} uri Schema's location
     * @return {Promise}
     */
    loadReference(id, url) {
        return Validator.fetchSchema(url)
            .then((schema) => {
                return this.setReference(id, schema);
            });
    }
    /**
     * Given a draft schema, add it to the `AJV` instance.
     *
     * @param {Object} draft JSON schema for the draft.
     * @return {Promise}
     */
    setDraft(draft) {
        this.ajv.addMetaSchema(draft);
        return Promise.resolve(draft);
    }
    loadDraft(url) {
        return Validator.fetchSchema(url)
            .then((draft) => {
                return this.setDraft(draft);
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
