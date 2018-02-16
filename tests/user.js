import API from '../api.js';
import Validator from '../validator.js';

describe('user tests', () => {
    it('should require argument to `getUser`', () => {
        const api = new API();
        expect(api.getUser).to.throwError();
    });
    it('should fail when the argument is not an object for `getUser`', () => {
        const api = new API();
        expect(api.getUser).withArgs(false).to.throwError();
        expect(api.getUser).withArgs(true).to.throwError();
        expect(api.getUser).withArgs(999).to.throwError();
        expect(api.getUser).withArgs('string').to.throwError();
        expect(api.getUser).withArgs([]).to.throwError();
        expect(api.getUser).withArgs([1, 2, 3]).to.throwError();
    });
    it('should fail when the argument object doesnt have `params` property for `getUser`', () => {
        const api = new API();
        expect(api.getUser).withArgs({}).to.throwError();
        expect(api.getUser).withArgs({ number: 1, place: 2, object: 3 }).to.throwError();
    });
    it('should be able to get the user by username', () => {
        const api = new API();
        const argument = {
            param: {
                username: 'testuser'
            }
        };
        return api.getUser(argument)
            .then((user) => {
                expect(user).to.be.an('object');
            });
    });
    it('should be able to get the user by id', () => {
        const api = new API();
        const argument = {
            param: {
                id: 'my-user-123'
            }
        };
        return api.getUser(argument)
            .then((user) => {
                expect(user).to.be.an('object');
            });
    });
    it('should get the full user object if skip `populate` property', () => {
        const api = new API();
        const validator = new Validator();
        const argument = {
            param: {
                username: 'testuser'
            }
        };
        return api.getUser(argument)
            .then((user) => {
                expect(user).to.be.an('object');
                return validator.validate('user', user);
            });
    });
});
