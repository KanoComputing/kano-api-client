import Validator from '../classes/Validator.js';

const testSchema = {
    $schema: 'http://json-schema.org/draft-6/schema#',
    description: 'Test schema',
    type: 'string'
};

describe('validator', () => {
    it('should instantiate', () => {
        const validator = new Validator(Ajv);
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
            Validator.fetchSchema('/schemas/test.json')
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
        return Validator.fetchSchema('/schemas/test.json')
            .then((schema) => {
                expect(schema).to.be.eql(testSchema);
            });
    });
    // SET SCHEMA
    it('should require a two arguments for `setSchema`', () => {
        const validator = new Validator(Ajv);
        const schemaName = 'testSchema';
        const shouldFail = [
            validator.setSchema(schemaName)
        ];
        const shouldSucceed = [
            validator.setSchema(schemaName, testSchema)
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
                    expect(validator.schemas[schemaName]).to.be.eql(testSchema);
                })
        ]);
    });
    it('should require a string and a json as arguments for `setSchema`', () => {
        const validator = new Validator(Ajv);
        const shouldFail = [
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
        const validator = new Validator(Ajv);
        const keyName = 'testKey';
        return validator.setSchema(keyName, testSchema)
            .then((schema) => {
                expect(schema).to.be.eql();
            });
    });
    // LOAD SCHEMA
    it('should resolve with json schema when calling `loadSchemas`', () => {
        const validator = new Validator(Ajv);
        const uriName = '/schemas/test.json';
        const keyName = 'testKey';
        return validator.loadSchema(keyName, uriName)
            .then((schema) => {
                expect(schema).to.be.eql(testSchema);
            });
    });
});
