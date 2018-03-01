/* eslint no-underscore-dangle: ["error", { "allow": ["_schemas"] }] */

import Validator from '../classes/Validator.js';
import Ajv from '../classes/Ajv.js';

const testSchema = {
    $schema: 'http://json-schema.org/draft-06/schema#',
    description: 'Test schema',
    type: 'object'
};

describe('validator', () => {
    it('should require `Ajv` class', () => {
        expect(() => {
            Ajv = undefined;
            return new Validator();
        }).to.throwError();
    });
    it('should instantiate', () => {
        const validator = new Validator({ Ajv });
        expect(validator).to.be.an('object');
        expect(validator).to.be.an(Validator);
    });
    // FETCH SCHEMA
    it('should require a string argument for `fetchSchema`', () => {
        const shouldFail = [
            Validator.fetchSchema(),
            Validator.fetchSchema(123),
            Validator.fetchSchema(false),
            Validator.fetchSchema({ test: 123 }),
            Validator.fetchSchema([1, 2, 3]),
            Validator.fetchSchema(() => {})
        ];
        const shouldSucceed = [
            Validator.fetchSchema('./test.json')
        ];

        return Promise.all([
            Promise.all(shouldFail)
                .then(() => {
                    throw new Error('Should not resolve');
                })
                .catch((err) => {
                    expect(err).to.be.ok();
                }),
            Promise.all(shouldSucceed)
                .then((response) => {
                    expect(response).to.be.ok();
                })
        ]);
    });
    it('shouldnt resolve if file doesnt exist for `fetchSchema` ', () => {
        return Validator.fetchSchema('file.json')
            .then(() => {
                throw new Error('Should not resolve');
            })
            .catch((error) => {
                expect(error.message).to.be.equal('File not found');
            });
    });
    it('should resolve with the json schema when calling `fetchSchema` ', () => {
        return Validator.fetchSchema('./test.json')
            .then((schema) => {
                expect(schema).to.be.eql(testSchema);
            });
    });
    // SET SCHEMA
    it('should require a string and a json as arguments for `setSchema`', () => {
        const validator = new Validator({ Ajv });
        const shouldFail = [
            validator.setSchema('test'),
            validator.setSchema('test', 'test'),
            validator.setSchema('test', () => {}),
            validator.setSchema('test', 123),
            validator.setSchema('test', false),
            validator.setSchema(() => {}, testSchema),
            validator.setSchema({ test: 123 }, testSchema),
            validator.setSchema([1, 2, 3], testSchema)
        ];
        const shouldSucceed = [
            validator.setSchema('test', testSchema)
        ];

        return Promise.all([
            Promise.all(shouldFail)
                .then(() => {
                    throw new Error('Should not resolve');
                })
                .catch((err) => {
                    expect(err).to.be.ok();
                }),
            Promise.all(shouldSucceed)
                .then((response) => {
                    expect(response).to.be.ok();
                })
        ]);
    });
    it('should resolve with nothing when calling `setSchema` ', () => {
        const validator = new Validator({ Ajv });
        const keyName = 'testKey';
        return validator.setSchema(keyName, testSchema)
            .then((schema) => {
                expect(schema).to.be(undefined);
            });
    });
    it('should set the schema', () => {
        const validator = new Validator({ Ajv });
        const keyName = 'testKey';
        return validator.setSchema(keyName, testSchema)
            .then(() => {
                expect(validator.schemas[keyName]).to.be.eql(testSchema);
            });
    });
    // LOAD SCHEMA
    it('should resolve with json schema when calling `loadSchemas`', () => {
        const validator = new Validator({ Ajv });
        const uri = './test.json';
        const keyName = 'testKey';
        return validator.loadSchema(keyName, uri)
            .then((schema) => {
                expect(schema).to.be.eql(testSchema);
                expect(validator.schemas[keyName]).to.be.eql(testSchema);
            });
    });
    // LOAD DRAFT
    it('should load draft into schemas', () => {
        const validator = new Validator({ Ajv });
        const draftPath = '../schemas/json-schema-draft-06.json';
        const keyName = 'http://json-schema.org/draft-06/schema';
        expect(validator.ajv._schemas[keyName]).to.not.be.ok();
        return validator.loadDraft(draftPath)
            .then(() => {
                expect(validator.ajv._schemas[keyName]).to.be.ok();
            });
    });
    // LOAD REFERENCE SCHEMAS
    it('should load references', () => {
        const validator = new Validator({ Ajv });
        const schemaName = 'test2Schema';
        const test2Schema = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            description: 'Test schema',
            type: 'object',
            required: ['propertyName'],
            properties: {
                propertyName: { $ref: 'common/test.json' }
            }
        };
        const data = { propertyName: {} };
        return validator.init()
            .then(() => {
                return validator.loadReference('common/test.json', './test.json');
            })
            .then(() => {
                return validator.setSchema(schemaName, test2Schema);
            })
            .then(() => {
                return validator.validate(schemaName, data);
            });
    });
    // VALIDATE
    it('should fail to validate on an inexistent schema', () => {
        const validator = new Validator({ Ajv });
        const schemaName = 'inexistent';
        const data = {};
        return validator.init()
            .then(() => {
                return validator.validate(schemaName, data)
                    .catch((error) => {
                        expect(error.message).to.be.equal('Schema does not exist');
                    });
            });
    });
    it('should resolve promise when validated', () => {
        const validator = new Validator({ Ajv });
        const schemaName = 'testKey';
        const data = { test: 123 };
        return validator.init()
            .then(() => {
                validator.setSchema(schemaName, testSchema);
                return validator.validate(schemaName, data);
            });
    });
    it('should reject promise when fail to validate', () => {
        const validator = new Validator({ Ajv });
        const schemaName = 'testKey';
        const data = [1, 2, 3];
        return validator.init()
            .then(() => {
                validator.setSchema(schemaName, testSchema);
                return validator.validate(schemaName, data);
            })
            .then(() => {
                throw new Error('Should not resolve');
            })
            .catch((error) => {
                expect(error).to.be.ok();
                expect(error.validation[0].message).to.be.equal('should be object');
            });
    });
});
