import Validator from '../validator.js';

const testSchema = {
  $schema: 'http://json-schema.org/draft-6/schema#',
  description: 'Test schema',
  type: 'string'
};

describe('validator', () => {
  it('should instantiate', () => {
    const validator = new Validator();
    expect(validator).to.be.an('object');
    expect(validator).to.be.an(Validator);
  });
  // FETCH SCHEMA
  it('should require a string argument for `fetchSchema`', () => {
    const validator = new Validator();
    expect(validator.fetchSchema).to.throwError();
    expect(validator.fetchSchema).withArgs(123).to.throwError();
    expect(validator.fetchSchema).withArgs(false).to.throwError();
    expect(validator.fetchSchema).withArgs({test: 123}).to.throwError();
    expect(validator.fetchSchema).withArgs([1, 2, 3]).to.throwError();
    expect(validator.fetchSchema).withArgs(() => {}).to.throwError();
    expect(validator.fetchSchema('string')).to.be.an(Promise);
  });
  it('shouldnt resolve if file doesnt exist for `fetchSchema` ', () => {
    const validator = new Validator();
    return validator.fetchSchema('file.json')
      .then(() => {
        throw new Error('Should not resolve');
      })
      .catch((error) => {
        expect(error.message).to.be.equal('File not found');
      });
  });
  it('should resolve with the json schema when calling `fetchSchema` ', () => {
    const validator = new Validator();
    return validator.fetchSchema('/schemas/test.json')
      .then((schema) => {
        expect(schema).to.be.eql(testSchema);
      });
  });
  // SET SCHEMA
  it('should require a two arguments for `setSchema`', () => {
    const validator = new Validator();
    const schemaName = 'testSchema';
    expect(validator.setSchema).withArgs('test').to.throwError();
    return validator.setSchema(schemaName, testSchema)
      .then(() => {
        expect(validator.schemas[schemaName]).to.be.eql(testSchema);
      });
  });
  it('should require a string and a json as arguments for `setSchema`', () => {
    const validator = new Validator();
    expect(validator.setSchema).withArgs('test', 'test').to.throwError();
    expect(validator.setSchema).withArgs('test', () => {}).to.throwError();
    expect(validator.setSchema).withArgs('test', 123).to.throwError();
    expect(validator.setSchema).withArgs('test', false).to.throwError();

    expect(validator.setSchema).withArgs(() => {}, testSchema).to.throwError();
    expect(validator.setSchema).withArgs({test: 123}, testSchema).to.throwError();
    expect(validator.setSchema).withArgs([1, 2, 3], testSchema).to.throwError();

    const promise = validator.setSchema('test', testSchema);
    expect(promise).to.be.an(Promise);
  });
  it('should reject if schemas dont exist when calling `setSchema` ', () => {
    let validator = new Validator();
    const keyName = 'testKey';
    delete validator.schemas;
    return validator.setSchema(keyName, testSchema)
      .then(() => {
        throw new Error('Should not resolve');
      })
      .catch((error) => {
        expect(error.message).to.be.equal('Validator is corrupted');
      })
  });
  it('should resolve with nothing when calling `setSchema` ', () => {
    const validator = new Validator();
    const keyName = 'testKey';
    return validator.setSchema(keyName, testSchema)
      .then((schema) => {
        expect(schema).to.be.eql();
      });
  });
  // LOAD SCHEMA
  it('should resolve with json schema when calling `loadSchemas`', () => {
    const validator = new Validator();
    const uriName = '/schemas/test.json';
    const keyName = 'testKey';
    return validator.loadSchemas(keyName, uriName)
      .then((schema) => {
        expect(schema).to.be.eql(testSchema);
      });
  });
});
