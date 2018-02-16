class Validator {
  constructor() {
    this.schemas = [];
  }
  getSchema(uri) {
    if (typeof uri != 'string') {
      throw new Error('Invalid argument');
    }
    return fetch(uri)
      .then((r) => {
        if (!r.ok) {
          throw new Error('File not found');
        }
        return r.json();
      });
  }
  setSchema(key, schema) {
    if (typeof key != 'string') {
      throw new Error('Invalid argument');
    }
    if (typeof schema != 'object') {
      throw new Error('Invalid argument');
    }
    if (!this.schemas) {
      return Promise.reject(new Error('Validator is corrupted'));
    }
    this.schemas[key] = schema;
    return Promise.resolve();
  }
}

export default Validator
