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
  it('should require a string argument for `getSchema`', () => {
    const validator = new Validator();
    expect(validator.getSchema).to.throwError();
    expect(validator.getSchema).withArgs(123).to.throwError();
    expect(validator.getSchema).withArgs(false).to.throwError();
    expect(validator.getSchema).withArgs({test: 123}).to.throwError();
    expect(validator.getSchema).withArgs([1, 2, 3]).to.throwError();
    expect(validator.getSchema).withArgs(() => {}).to.throwError();
    expect(validator.getSchema('string')).to.be.an(Promise);
  });
  it('shouldnt resolve if file doesnt exist for `getSchema` ', () => {
    const validator = new Validator();
    return validator.getSchema('file.json')
      .then(() => {
        throw new Error('Should not resolve');
      })
      .catch((error) => {
        expect(error.message).to.be.equal('File not found');
      });
  });
  it('should resolve with the json schema when calling `getSchema` ', () => {
    const validator = new Validator();
    return validator.getSchema('/schemas/test.json')
      .then((schema) => {
        expect(schema).to.be.eql(testSchema);
      });
  });
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
});
