import API from '../api.js';
describe('user tests', () => {
    it('should require argument to `getUser`', () => {
      const api = API();
      expect(api.getUser).to.throwError();
    });
    it('should fail when the argument is not an object for `getUser`', () => {
      const api = API();
      expect(api.getUser).withArgs(false).to.throwError();
      expect(api.getUser).withArgs(true).to.throwError();
      expect(api.getUser).withArgs(999).to.throwError();
      expect(api.getUser).withArgs('string').to.throwError();
      expect(api.getUser).withArgs([]).to.throwError();
      expect(api.getUser).withArgs([1, 2, 3]).to.throwError();
    });
    it('should fail when the argument object doesnt have `params` property for `getUser`', () => {
      const api = API();
      expect(api.getUser).withArgs({}).to.throwError();
      expect(api.getUser).withArgs({ 'number': 1, 'place': 2, 'object': 3}).to.throwError();
    });
    it('should get the user by username', (done) => {
      const api = API();
      const argument = {
        param: {
          username: 'testuser'
        }
      };
      api.getUser(argument)
        .then((user) => {
          expect(user).to.be.an('object');
          done();
        });
    });
    it('should return an object that matches the user schema', (done) => {
      const api = API();
      const argument = {
        param: {
          username: 'testuser'
        }
      };
      api.getUser(argument)
        .then((user) => {
          expect(user).to.be.an('object');
          done();
        });
    });

});
