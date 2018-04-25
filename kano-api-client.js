
import '../gun/gun.js';

const client = (settings) => {
    const initialStateLoggedInUser = localStorage.getItem('user');
    let initialStateUser = false;
    if (initialStateLoggedInUser) {
        initialStateUser = initialStateLoggedInUser.username;
    }
    const stackOfXhr = {};
    // libraries
    const gun = Gun();
    // functions
    function ifArray(data) {
        if (typeof data === 'object' && Object.keys(data).length && '012345678910'.startsWith(Object.keys(data).join('').slice(0, -1))) {
            return Object.keys(data).reduce((a, v) => {
                if (v !== '_' && v === +v) {
                    a.push(v);
                }
                return a;
            }, []).map((value) => {
                return data[value];
            });
        }
        return data;
    }
    function getter(query, params, sync) {
        return new Promise((resolve, reject) => {
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            let queryRun = query;
            if (loggedInUser) {
                if (query === 'user._accessToken') {
                    resolve(loggedInUser._accessToken);
                    return;
                } else if (query === 'user.username') {
                    resolve(loggedInUser.username);
                    return;
                } else if (query === 'user._localToken') {
                    resolve(loggedInUser._localToken);
                    return;
                } else if (query.startsWith('user.') || query === 'user') {
                    queryRun = query.replace('user', loggedInUser.mapTo);
                }
            } else if (query.startsWith('user.')) {
                resolve(undefined);
                return;
            }
            queryRun.split('.*')[0].split('.').reduce((db, val) => { // TODO use "gun load"  if ".*"
                return db.get(val);
            }, gun).once((data) => {
                if (sync && data === undefined) { //
                    if (query.startsWith('users.')) { //
                        const username = query.split('.')[1];
                        const user = gun.get('users').get(query.split('.')[1]);
                        if (params === 'check' && query.split('.').length === 2) {
                            getDataFromServer(`/accounts/checkUsernameExists/${username}`).then((serverRes) => {
                                const data = JSON.parse(serverRes).data;
                                resolve(data);
                                if (data) {
                                    user.set({});
                                }
                            });
                        } else {
                            getDataFromServer(`/users/?username=${query.split('.')[1]}`).then((serverRes) => {
                                const serverData = JSON.parse(serverRes, (key, value) => {
                                    if (Array.isArray(value)) {
                                        value = value.reduce((acc, curValue, curIndex) => {
                                            acc[curIndex] = curValue;
                                            return acc;
                                        }, {});
                                    }
                                    return value;
                                });
                                Object.keys(serverData.data).map((key) => {
                                    user.get(key.replace('_', '')).put(serverData.data[key]);
                                });
                            }).then(() => {
                                query.split('.').reduce((db, val) => {
                                    return db.get(val);
                                }, gun).once((retry) => {
                                    data = retry;
                                });
                            }).then(() => {
                                resolve(ifArray(data));
                            })
                                .catch((e) => {
                                    reject(e);
                                });
                        }
                    }
                } else {
                    resolve(ifArray(data));
                }
            });
        });
    }
    function arraysToObject(valueToSet) {
        return JSON.parse(JSON.stringify(valueToSet, (_, value) => {
            if (Array.isArray(value)) {
                return value.reduce((accumulator, currentValue, currentIndex) => {
                    return accumulator[currentIndex] = currentValue;
                }, {});
            }
            return value;
        }));
    }
    function setter(query, valueToSet, params) {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser) {
            if (query.startsWith('user.') || query === 'user') {
                query = query.replace('user', loggedInUser.mapTo);
            }
        }

        valueToSet = arraysToObject(valueToSet);

        let oldValue;
        let newValue;
        return getter(query).then((data) => {
            oldValue = data;
        }).then(() => {
            return query.split('.').reduce((db, val) => {
                return db.get(val);
            }, gun).put(valueToSet);
        }).then(() => {
            return getter(query).then((data) => {
                newValue = data;
            });
        })
            .then(() => {
                if (oldValue != undefined ||
                JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                    // add to postList
                    if (settings.log) { console.log('needs sync', newValue); }
                } else if (settings.log) { console.log('In sync', newValue); }
            })
            .then(() => {
                return newValue;
            });
    }
    function onIdle(itime, doAfter) {
        return new Promise((resolve, reject) => {
            let trys = 0;
            const onIdleTest = () => {
                const t = performance.now();
                setTimeout(() => {
                    if (doAfter && trys++ > doAfter) {
                        resolve();
                    }
                    if (Math.round(performance.now() - t) === Math.round(itime)) {
                        resolve();
                    } else {
                        onIdleTest();
                    }
                }, itime);
            };
            onIdleTest();
        });
    }

    function getDataFromServer(path) {
        return new Promise((resolve, reject) => {
            if (stackOfXhr[path]) {
                stackOfXhr[path].push(resolve);
            } else {
                stackOfXhr[path] = [resolve];
                if (!navigator.onLine) {
                    reject('offline');
                }
                getter('user._accessToken').then((accessToken) => {
                    const xhr = new XMLHttpRequest();
                    if (accessToken) {
                        xhr.withCredentials = true;
                    }
                    xhr.addEventListener('readystatechange', function () {
                        if (this.readyState === 4 && this.status < 300) {
                            if (this.responseText) {
                                const responseText = this.responseText;
                                stackOfXhr[path].forEach((resolved) => {
                                    resolved(responseText);
                                });
                                delete (stackOfXhr[path]);
                            } else {
                                reject('No Response');
                            }
                        }
                    });
                    xhr.open('GET', settings.worldUrl + path);
                    xhr.setRequestHeader('content-type', 'application/json');
                    xhr.setRequestHeader('accept', 'application/json');
                    if (accessToken) {
                        xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
                    }
                    if (settings.log) { console.log('get', path); }
                    xhr.send({});
                });
            }
        });
    }
    function renewToken() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.renew < Date.now() && user._accessToken) {
            getDataFromServer('/accounts/auth/refresh').then((res) => {
                if (settings.log) { console.log(res); }
                // duration
                // user
                if (JSON.parse(res).data && JSON.parse(res).data.token) {
                    const token = JSON.parse(res).data.token;
                    const duration = JSON.parse(res).data.duration;
                    const renew = Date.now() + ((duration / 2) * 1000);

                    localStorage.setItem('user', JSON.stringify({
                        mapTo: `users.${user.username}`,
                        username: user.username,
                        _localToken: user.localToken, // to encrypt with when logged out
                        _accessToken: token, // to access server
                        userHash,
                        renew
                    }));
                }
            });
        }
    }
    function poster(payload, path, accessToken) {
        return new Promise((resolve, reject) => {
            if (!navigator.onLine) {
                reject('offline');
            }
            const xhr = new XMLHttpRequest();

            xhr.addEventListener('readystatechange', () => {
                if (this.readyState === 4) {
                    if (this.responseText && this.status < 300) {
                        onIdle(1000, 10).then(renewToken);
                        resolve(this.responseText);
                    } else {
                        reject(this.statusText, this.status);
                    }
                }
            });

            xhr.open('POST', settings.worldUrl + path);

            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('cache-control', 'no-cache');
            if (accessToken) {
                xhr.setRequestHeader('authorization', `Bearer ${accessToken}`);
            }
            xhr.send(JSON.stringify(payload));
        });
    }
    function sha256(str) {
        // We transform the string into an arraybuffer.
        const buffer = new TextEncoder('utf-8').encode(str);
        return crypto.subtle.digest('SHA-256', buffer).then((hash) => {
            return hash;
        });
    }
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
    function str2ab(str) {
        const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        const bufView = new Uint16Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    function arrayToBase64(ab) {
        const dView = new Uint8Array(ab); // Get a byte view
        const arr = Array.prototype.slice.call(dView); // Create a normal array
        const arr1 = arr.map((item) => {
            return String.fromCharCode(item); // Convert
        });
        return window.btoa(arr1.join('')); // Form a string
    }
    function base64ToArrayBuffer(s) {
        const asciiString = window.atob(s);
        return new Uint8Array([...asciiString].map((char) => { return char.charCodeAt(0); }));
    }
    function keyFromLocalToken(localToken) {
        return window.crypto.subtle.importKey('jwk', {
            kty: 'oct', k: localToken, alg: 'A256CBC', ext: true
        }, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
    }
    function encryptString(localToken, data) {
        return keyFromLocalToken(localToken).then((key) => {
            const iv = window.crypto.getRandomValues(new Uint8Array(16));
            return window.crypto.subtle.encrypt({
                name: 'AES-CBC',
                iv
            }, key, str2ab(`12345678${data}`) // add 8 chr due to droppinginitial vector
            );
        }).then((encrypted) => {
            return ab2str(encrypted);
        });
    }
    function decryptString(localToken, data) {
        return keyFromLocalToken(localToken).then((key) => {
            return window.crypto.subtle.decrypt(
                {
                    name: 'AES-CBC',
                    iv: window.crypto.getRandomValues(new Uint8Array(16))
                },
                key, // from generateKey or importKey above
                str2ab(data),
            );
        }).then((decrypted) => {
            return ab2str(decrypted).slice(8);
        });
    }
    function makeLocalToken(username, password) {
        return sha256(username + password).then((localhash) => {
            return crypto.subtle.importKey('raw', localhash, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt']);
        }).then((key) => {
            return sha256(username).then((userSHA) => {
                const data = localStorage.getItem(arrayToBase64(userSHA));
                if (data) {
                    localStorage.removeItem(arrayToBase64(userSHA));
                    window.crypto.subtle.decrypt(
                        {
                            name: 'AES-CBC',
                            iv: window.crypto.getRandomValues(new Uint8Array(16))
                        },
                        key, // from generateKey or importKey above
                        str2ab(data) // ArrayBuffer of the data
                    ).then((decrypted) => {
                        // TODO put ES-CBC
                        // as no initial Factor I need to chop off the first 8 characters
                        localStorage.setItem('user', ab2str(decrypted).slice(8));
                    }).catch((err) => {
                        console.error(err);
                    });
                }
                return key;
            }).then((key) => {
                // if encrypted data decrypt it
                return crypto.subtle.exportKey('jwk', key);
            }).then((keydata) => {
                // returns the exported key data
                return keydata.k; // save the hard bit
            });
        });
    }
    if (settings && settings.worldUrl) {
        const API = {
            isLoggedIn: initialStateUser,
            check: (query) => {
                return getter(query, 'check', true).then((data) => { return !!data; });
            },
            create: (args) => {
                const loggedInUser = localStorage.getItem('user');
                if (args.params.user && !loggedInUser) {
                    const argUser = args.params.user;
                    if (argUser.username && argUser.password && argUser.email) {
                        if (!argUser.erole) { argUser.erole = 'notset'; }
                        //  if (!args.params.user.epurpose) {args.params.user.epurpose = "notset"}
                        return poster(argUser, '/accounts').then((res) => {
                            if (settings.log) { console.log(res); }
                            // duration
                            // user
                            if (JSON.parse(res).data && JSON.parse(res).data.token) {
                                const token = JSON.parse(res).data.token;
                                const duration = JSON.parse(res).data.duration;
                                const renew = Date.now() + ((duration / 2) * 1000);
                                const user = JSON.parse(res).data.user;

                                API.isLoggedIn = user.username;

                                return makeLocalToken(
                                    user.username,
                                    user.password
                                ).then((localToken) => {
                                    return sha256(user.username).then((hash) => {
                                        const userHash = arrayToBase64(hash);
                                        return localStorage.setItem('user', JSON.stringify({
                                            mapTo: `users.${user.username}`,
                                            username: user.username,
                                            _localToken: localToken,
                                            _accessToken: token, // to access server
                                            userHash,
                                            renew
                                        }));
                                    });
                                }).then(() => {
                                    args.params = {
                                        user
                                    };
                                    return API.update(args);
                                });
                            }
                            throw res;
                        }).catch((err) => {
                            console.error('error create user', err);
                        });
                    }
                }
            },
            read: (args) => {
                if (args.populate) {
                    const allThePromises = [];
                    const allThePromisesKeys = [];
                    const bulid = JSON.parse(JSON.stringify(args.populate), (_, value) => {
                        if (typeof value === 'string' && /^[_a-z0-9\-\.]*$/i.test(value)) {
                            if (settings.resolve) {
                                allThePromisesKeys.push(value);
                                allThePromises.push(getter(value, args.params, args.sync));
                                return value;
                            }
                            return getter(value, args.params, args.sync);
                        }
                        return value;
                    });
                    if (settings.resolve) {
                        return Promise.all(allThePromises).then((values) => {
                            return JSON.parse(JSON.stringify(args.populate), (_, value) => {
                                if (typeof value === 'string' && /^[_a-z0-9\-\.]*$/i.test(value)) {
                                    return values[allThePromisesKeys.indexOf(value)];
                                }
                                return value;
                            });
                        });
                    }
                    return bulid;
                }
                return {};
            },
            update: (args) => {
                Object.keys(args.params).forEach((key) => {
                    setter(key, args.params[key]);
                });
                return API.read(Object.assign({ sync: true }, args));
            },
            delete: (args) => {
                // TODO map value to Null
                return API.update(JSON.parse(JSON.stringify(args.params), () => {
                    return null;
                }));
            },
            getUser: (args) => {
                // TODO test if update okay
                return API.read({ params: { user: args.params }, populate: args.populate });
            },
            login: (args) => {
                if (!args.params) {
                    throw "need params e.g. API.login({params: {username: 'marcus7777', password: 'monkey123'}})";
                }
                if (!args.params.username) {
                    throw "need a username e.g. {username: 'marcus7777', password: 'monkey123'}";
                }
                args.params.username = args.params.username.toLowerCase();

                // are you login already?
                return API.read({ populate: { username: 'user.username', _localToken: 'user._localToken', _accessToken: 'user._accessToken' }, sync: false }).then(async (user) => {
                    if (!user) {
                        if (settings.log) { console.error('error got user'); }
                    }
                    if (await user.username === undefined) {
                        if (!args.params.password) {
                            throw "need a password e.g. {username: 'marcus7777', password: 'monkey123'}";
                        }
                        return makeLocalToken(
                            await user.username,
                            await user.password
                        ).then((localToken) => {
                            return poster(args.params, '/accounts/auth').then((res) => {
                                const token = JSON.parse(res).data.token;
                                const duration = JSON.parse(res).data.duration;
                                const renew = Date.now() + ((duration / 2) * 1000);

                                API.isLoggedIn = args.params.username;

                                return sha256(args.params.username).then((userHashAb) => {
                                    const userHash = arrayToBase64(userHashAb);
                                    localStorage.setItem('user', JSON.stringify({
                                        mapTo: `users.${args.params.username}`,
                                        username: args.params.username,
                                        _localToken: localToken, // to encrypt with when logged out
                                        _accessToken: token, // to access server
                                        userHash,
                                        renew
                                    }));
                                }).then(() => {
                                    return API.read({ populate: args.populate });
                                });
                            });
                        }).catch((err) => {
                            if (err === 'offline') {
                                return API.read(args);
                            }
                            console.error(err);
                            throw err;
                        });
                        // TODO  if logged in as something else
                    } else if (await user.username === args.params.username) {
                        if (settings.log) { console.log('you are (and were) logged in :)'); }
                    } else if (await user.username !== args.params.username) {
                        API.logout();
                        API.login(args);
                    }
                    return API.read(Object.assign({ sync: true }, args));
                });
            },
            logout: () => {
                return getter('user._localToken').then((localToken) => {
                    if (localToken) {
                        const ls = localStorage;
                        encryptString(localToken, ls.getItem('user')).then((encrypted) => {
                            sha256(ls.user.username).then((userSHA) => {
                                ls.setItem(arrayToBase64(userSHA), ab2str(encrypted));
                                ls.removeItem('user');
                            });
                            API.isLoggedIn = false;
                        }).catch((err) => {
                            console.error(err);
                        });
                    }
                }).catch((err) => {
                    console.error(err);
                });
            }
        };
        return API;
    }
    console.error('Need a worldUrl');
};
export default client;
