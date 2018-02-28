// TODO: Find a way to import `Ajv` here
import * as Ajv from './node_modules/ajv/dist/ajv.min.js';
import draft6 from './schemas/json-schema-draft-06.js';

// Common Schemas
import badgeSchema from './schemas/common/badge.json';
import challengeSetSchema from './schemas/common/challenge-set.json';
import characterGeneratorSchema from './schemas/common/character-generator.json';
import rolesSchema from './schemas/common/roles.json';

// Methods Schemas
import createUserSchema from './schemas/methods/create-user.json';
import getUserSchema from './schemas/methods/get-user.json';
import updateUserSchema from './schemas/methods/update-user.json';
import removeUserSchema from './schemas/methods/remove-user.json';

// Entities Schemas
import notificationSchema from './schemas/entities/notification.json';
import userSchema from './schemas/entities/user.json';

class Validator {
    constructor() {
        // TODO: "Fetch" schemas. It's important to solve how to know the path
        // for the schemas, knowing they will be in a different path when testing
        // and in different plattforms (Cordova, web, electron)

        // TODO: Attach an instance of `Ajv`
        this.ajv = new Ajv();
        // this.ajv = new Ajv({ allErrors: true });

        // TODO: Setup `Ajv` draft
        this.ajv.addMetaSchema(draft6);

        // TODO: Register "common" schemas
        this.ajv.addSchema(badgeSchema, 'common/badge.json');
        this.ajv.addSchema(challengeSetSchema, 'common/challenge-set.json');
        this.ajv.addSchema(characterGeneratorSchema, 'common/character-generator.json');
        this.ajv.addSchema(rolesSchema, 'common/roles.json');

        this.schemas = {
            // Methods
            'create-user': createUserSchema,
            'get-user': getUserSchema,
            'update-user': updateUserSchema,
            'remove-user': removeUserSchema,

            // Entities
            'notification-entity': notificationSchema,
            'user-entity': userSchema

        };


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
