import client from '../kano-api-client.js';

const mockApiUrl = './mockApi/';
const realApiUrl = 'http://ksworldapi-dev.us-west-1.elasticbeanstalk.com/'; // temporary for test, of course

const ls = { // mock localStorage
    _data: {},
    setItem(id, val) { return this._data[id] = val; },
    getItem(id) { return this._data[id]; },
    removeItem(id) { return delete this._data[id]; },
    clear() { return this._data = {}; },
};

function calculateHashOfName(name) {
    const hashOfName = sha256(name).then(hash => arrayToBase64(hash));

    return hashOfName;
}

function sha256(str) {
    // We transform the string into an arraybuffer.
    const buffer = new TextEncoder('utf-8').encode(str);
    return crypto.subtle.digest('SHA-256', buffer).then(hash => hash);
}

function arrayToBase64(ab) {
    const dView = new Uint8Array(ab); // Get a byte view
    const arr = Array.prototype.slice.call(dView); // Create a normal array
    const arr1 = arr.map(item =>
        String.fromCharCode(item), // Convert
    );
    return window.btoa(arr1.join('')); // Form a string
}

// START tests with mock API

suite('client base mocked', () => {
    test('client throws if no settings', () => {
        try {
            client();
        } catch (e) {
            assert.equal(e.message, "settings are needed eg. client({defaultUrl:'./mockApi'})");
        }
    });
    test('client throws if settings but no default url', () => {
        try {
            client({});
        } catch (e) {
            assert.equal(e.message, "defaultUrl is needed eg. client({defaultUrl:'./mockApi'})");
        }
    });
    test("client loads if client({defaultUrl:'./mockApi'})", () => {
        const API = client({
            defaultUrl: mockApiUrl,
        });
        assert.ok(API);
    });
    test('make sure there is no user logged in yet', () => {
        const API = client({
            defaultUrl: mockApiUrl,
        });
        assert.equal(API.isLoggedIn(), false);
    });
    test('make sure there is user logged in', () => {
        ls.setItem('user', '{"mapTo":"users.test08956548851822832","username":"test08956548851822832","_localToken":"u8X9oWDTTQ7CL9_LyQaTBkWwqXOCAQvznGnBqEFeJ8s","_accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODM2MzI0ODguODk2LCJ1c2VyIjp7ImlkIjoxMDI2Miwicm9sZXMiOltdfX0.X24m9Z4dgDI_zLToCrhSYi6LRfYzBbY5jvGk7YyyiLU","renew":1554832488942}');
        const API = client({
            defaultUrl: mockApiUrl,
            localStorage: ls,
        });
        assert.equal(API.isLoggedIn(), 'test08956548851822832');
    });
    test('has username been not taken', () => {
        const API = client({
            defaultUrl: mockApiUrl,
            getDataFromServer: () => new Promise((resolve) => {
                resolve({ data: 'false' });
            }),
        });
        const query = 'users.marcus7778';
        API.check(query).then((exists) => {
            assert.equal(exists, false);
        });
    });
    test('has username been taken', () => {
        const API = client({
            defaultUrl: mockApiUrl,
            getDataFromServer: () => new Promise((resolve) => {
                resolve({ data: 'true' });
            }),
        });
        const query = 'users.marcus7777';
        API.check(query).then((exists) => {
            assert.equal(exists, true);
        });
    });
    test('forgotUsername for a no email', () => {
        const API = client({
            defaultUrl: mockApiUrl,
        });
        try {
            API.forgotUsername({
                params: {
                    user: {
                    },
                },
            });
        } catch (e) {
            assert.equal(e.message, 'need a params.user.email in the Object');
        }
    });
    test('forgotUsername for a valid email', () => {
        const API = client({
            defaultUrl: mockApiUrl,
            poster() {
                return new Promise(((resolve, reject) => {
                    resolve(true);
                }));
            },
        });
        API.forgotUsername({
            params: {
                user: {
                    email: 'marcus@hhost.me',
                },
            },
        }).then((ok) => {
            assert.ok(ok);
        });
    });
    test('forgotUsername for a invalid email', () => {
        const API = client({
            defaultUrl: mockApiUrl,
        });
        try {
            API.forgotUsername({
                params: {
                    user: {
                        email: '1234567890f7ypfy873pf1234567891234567.com',
                    },
                },
            });
        } catch (e) {
            assert.equal(e.message, 'invalid email');
        }
    });
    test('forgotPassword for a no username', () => {
        const API = client({
            defaultUrl: mockApiUrl,
        });
        try {
            API.forgotPassword({
                params: {
                    user: {
                    },
                },
            });
        } catch (e) {
            assert.equal(e.message, 'need a params.user.username in the Object');
        }
    });
    test('forgotPassword for a valid username', () => {
        const API = client({
            defaultUrl: mockApiUrl,
            poster() {
                return new Promise(((resolve) => {
                    resolve(true);
                }));
            },
        });
        API.forgotPassword({
            params: {
                user: {
                    username: 'marcus7777',
                },
            },
        }).then((ok) => {
            assert.ok(ok);
        });
    });
    test('forgotPassword for a invalid username', () => {
        const API = client({
            defaultUrl: mockApiUrl,
            poster() {
                return new Promise(((resolve, reject) => {
                    reject(true);
                }));
            },
        });
        try {
            API.forgotPassword({
                params: {
                    user: {
                        username: '...',
                    },
                },
            }).then(() => {
                assert.equal(1, 0);
            });
        } catch (e) {
            assert.equal(e.message, 'invalid username');
        }
    });
});
function mock1() {
    const name = 'testing';
    calculateHashOfName(name).then(async (res) => {
        const hashOfName = await res;
        suite('client user mock', () => {
            const password = 'm0nk3y123';

            test('can a user be created', () => {
                localStorage.clear();
                const API = client({
                    defaultUrl: mockApiUrl,
                    poster() {
                        return new Promise(((resolve) => {
                            resolve(JSON.parse('{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}'));
                        }));
                    },
                });
                return API.create({
                    params: {
                        user: {
                            username: name,
                            email: 'marcus@kano.me',
                            password,
                        },
                    },
                    populate: {
                        id: 'user.id',
                    },
                }).then(async (user) => {
                    assert.equal(await user.id, '5ae9b582a82d9f26ec6ea2ea');
                });
            });
            test('user is logged in', () => {
                localStorage.clear();
                const API = client({
                    defaultUrl: mockApiUrl,
                    poster: () => new Promise((resolve) => {
                        resolve(JSON.parse('{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}'));
                    }),
                    getDataFromServer: () => new Promise((resolve) => {
                        resolve(JSON.parse('{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}'));
                    }),
                });
                return API.login({
                    params: {
                        user: {
                            username: name,
                            password,
                        },
                    },
                }).then(() => {
                    assert.equal(API.isLoggedIn(), name);
                });
            });
            test('user is logged in and out', () => {
                localStorage.clear();

                const API = client({
                    defaultUrl: mockApiUrl,
                    poster: () => new Promise((resolve) => {
                        resolve(JSON.parse('{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}'));
                    }),
                    getDataFromServer: () => new Promise((resolve) => {
                        resolve(JSON.parse('{"data":{"duration":"57600000","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1ODI4NjU3OTUuMTA1LCJ1c2VyIjp7ImlkIjoiNWFlOWI1ODJhODJkOWYyNmVjNmVhMmVhIiwicm9sZXMiOltdfX0.0HwbZkelvGFAxX51ihNeNFRqh79xti_jOmn_EyYNsGU","user":{"id":"5ae9b582a82d9f26ec6ea2ea","roles":[],"modified":"2018-05-02T12:56:35.075266"}},"path":"/users/5ae9b582a82d9f26ec6ea2ea"}'));
                    }),
                });
                return API.login({
                    params: {
                        user: {
                            username: name,
                            password,
                        },
                    },
                }).then(() => API.logout()).then(() => {
                    assert.ok(localStorage.getItem(hashOfName), 'not save encryptString');
                    return assert.equal(API.isLoggedIn(), false);
                });
            });
            test('logout should return promise', () => {
                localStorage.clear();

                const API = client({
                    defaultUrl: mockApiUrl,
                });
                API.logout().then(() => assert.equal(API.isLoggedIn(), false));
            });
            test('user is logged in if off-line', () => {
                ls.setItem(hashOfName, 'xyEQklDaPj/JfcGsZ+y3WGSmmBBB30exF/Yr6Br86nkgNvvpG0aKdR3wkCyxcDDOAGhNcbLFTWLKG8ov2PPxKz95tYuLMrDa1NE9Fn9AJHVMiYHlgkWzKe+vRaUMO2YGtAZyB/y7U1lX+un8JQfauX/Az7myXeeLq6C4+YzHzTRBuE5Q3bxh1uG9mmHEwqN/cYDA87MpqiTprhMCuUpod8Ven3jpgoVnHuCLkOaUDycgJXwLnasa4PVKoCBiGICLQ/nc78uNmJuL1NgHL2pE64I42ha2+cUDKYf6Zbpzop9H4+P2HTl0v+OZYJMumYaP+iN9NWVRV+yyP7ub4fpHFJb7jyp42kN1eT4lNiq74DcUHks2kBCZunKqeJDmE+xPciql9C53AQVr5+5q/YBxgqw0oOoWeXI5pZ2nXwpn+Fuo4+mzXN414PqTD3omlIJzojCmsIC8u24ZdQxuaT3kq0NL2KxsWM3XQ+GGP4Ol4bUTiUwwIhbmLvyhtylutjiBY/2GDpbX5bCPlEU2WGijsBmRaQIBe2y4nliUNyvT8dT85PBNNBWGU/2eICLxXcxwdAycSoJ/1kqPsdnw4+i95WFhI9iARCosnBzMZQ8tkilrBVD82wN1pAO7rcxwwBmm69vEUm3Tdbm0lXwTx45NKU2dPFr0EUvWV4Mo/0CAyg6qqLKqj1dm9CdvIVK4N+OBao2EoajUepQhOUADM+zX92lJr01/0r+945nupwOlaul2mrPDbjlnEzx4zCFjbFajZIAv0sE9Nh+uIriGo2IegtJa2pIiTzTVEaV+Wd0WZdxReKkfpIYcat1D2kWnQZirkAwI3h+XuVndUbwTo5NQheQIl9hayVXPyaoomIe4jlH8+3VanW8U6DVU90P64AZT');
                ls.setItem(`${hashOfName}iv`, '136,179,253,164,23,155,253,237,52,133,22,146,93,125,19,237');

                const API = client({
                    defaultUrl: mockApiUrl,
                    poster: () => {
                        throw new Error('offline');
                    },
                    getDataFromServer: () => {
                        throw new Error('offline');
                    },
                    localStorage: ls,
                });
                return API.login({
                    params: {
                        user: {
                            username: name,
                            password,
                        },
                    },
                }).then(() => {
                    assert.ok(ls.getItem('user'), 'not load decrypted user');
                    return assert.equal(API.isLoggedIn(), name);
                });
            });
        });
    });
}
mock1();
// END tests with fake API

// START tests with real API

suite('client base real', () => {
    test('client loads if client({defaultUrl:realApiUrl)', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        assert.ok(API);
    });
    test('make sure there is no user logged in yet', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        assert.equal(API.isLoggedIn(), false);
    });
    test('has username been not taken', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        const query = `users.test${(`${Math.random()}`).replace('.', '')}`;
        return API.check(query).then((exists) => {
            assert.equal(exists, false);
        });
    });
    test('has username been taken', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        const query = 'users.nectarsoft';
        return API.check(query).then((exists) => {
            assert.equal(exists, true);
        });
    });
    test('forgotUsername for a no email', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        try {
            return API.forgotUsername({
                params: {
                    user: {
                    },
                },
            });
        } catch (e) {
            assert.equal(e.message, 'need a params.user.email in the Object');
        }
    });
    test('forgotUsername for a valid email', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        API.forgotUsername({
            params: {
                user: {
                    email: 'marcus@hhost.me',
                },
            },
        }).then((ok) => {
            assert.ok(ok);
        });
    });
    test('forgotUsername for a invalid email', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        try {
            API.forgotUsername({
                params: {
                    user: {
                        email: '1234567890f7ypfy873pf1234567891234567.com',
                    },
                },
            });
        } catch (e) {
            assert.equal(e.message, 'invalid email');
        }
    });
    test('forgotPassword for a no username', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        try {
            API.forgotPassword({
                params: {
                    user: {
                    },
                },
            });
        } catch (e) {
            assert.equal(e.message, 'need a params.user.username in the Object');
        }
    });
    test('forgotPassword for a valid username', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        API.forgotPassword({
            params: {
                user: {
                    username: 'marcus7777',
                },
            },
        }).then((ok) => {
            assert.ok(ok);
        });
    });
    test('forgotPassword for a invalid username', () => {
        const API = client({
            defaultUrl: realApiUrl,
        });
        try {
            API.forgotPassword({
                params: {
                    user: {
                        username: '...',
                    },
                },
            }).then(() => {
                assert.equal(1, 0);
            });
        } catch (e) {
            assert.equal(e.message, 'invalid username');
        }
    });
});
function real1() {
    localStorage.clear();
    const num = (`${Math.random()}`).replace('.', '');
    const name = `test${num}`;
    const password = 'm0nk3y123';
    calculateHashOfName(name).then((hashOfName) => {
        suite('client user real', () => {
        // should return an error user exists
            test('try and create a user that already exists', () => {
                const API = client({
                    defaultUrl: realApiUrl,
                });
                try {
                    return API.create({
                        params: {
                            user: {
                                username: 'nectarsoft',
                                email: 'marcus@kano.me',
                                password,
                            },
                        },
                        populate: {
                            id: 'user.id',
                        },
                    }).then(() => {
                        assert.ok(false);
                    }).catch((e) => {
                        assert.equal(e.message, 'Conflict');
                    });
                } catch (e) {
                    assert.equal(e.message, 'Conflict');
                }
            });
            test('can a user be created then logout,login off-line', () => {
                console.log('Name', name);
                const API = client({
                    defaultUrl: realApiUrl,
                    localStorage: ls,
                });
                const APIOffLine = client({
                    defaultUrl: realApiUrl,
                    localStorage: ls,
                    poster: () => {
                        throw new Error('offline');
                    },
                    getDataFromServer: () => {
                        throw new Error('offline');
                    },
                });
                const assertLoggedIn = API.create({
                    params: {
                        user: {
                            username: name,
                            email: 'marcus@kano.me',
                            password,
                        },
                    },
                    populate: {
                        id: 'user.id',
                        username: 'user.username',
                    },
                }).then(async (user) => {
                    console.log(user);
                    return assert.equal(await user.username, name);
                });
                const assertLoggedBackOut = assertLoggedIn.then(() => API.logout())
                    .then(() => assert.equal(API.isLoggedIn(), false));

                const assertLoggedInOffline = assertLoggedBackOut.then(() => APIOffLine.login({
                    params: {
                        user: {
                            username: name,
                            password,
                        },
                    },
                    populate: {
                        id: 'user.id',
                        username: 'user.username',
                    },
                })).then(async user => assert.equal(await user.username, name));
            });
            test('logout should return promise', () => {
                const API = client({
                    defaultUrl: realApiUrl,
                });
                API.logout().then(() => assert.equal(API.isLoggedIn(), false));
            });
        });
    });
}
real1();

// END tests with real API
